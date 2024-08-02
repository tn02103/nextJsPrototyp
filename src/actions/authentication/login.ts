"use server";

import { getPrisma } from "@/lib/db";
import { getMailAgend } from "@/lib/mailAgend";
import { loginFormSchema, LoginFormSchema } from "@/zod/login";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import moment from 'moment';
import { headers } from "next/headers";
import { TOTP } from "otpauth";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { setTimeout } from "timers/promises";
import { z } from "zod";
var generator = require('generate-password');


const ipLimiter = new RateLimiterMemory({
    points: 15, // 15 failed attempts allowed
    duration: 60 * 15, // reset after 15 minutes
});

const userCounter = new RateLimiterMemory({
    duration: 60 * 15 // resets after 15 minutes
});

const failed2FACounter = new RateLimiterMemory({
    points: 20,
    duration: 60 * 60 * 2 // resetzt after 2 hours 
});

async function saveLoginAttempt(props: {
    ipAdress: string;
    username: string;
    acronym: string;
    withToken: boolean;
    successful: boolean;
    message: string;
}) {
    await getPrisma('').loginAttempt.create({
        data: {
            ipAdress: props.ipAdress,
            username: props.username,
            acronym: props.acronym,
            withToken: props.withToken,
            successful: props.successful,
            message: props.message,
        }
    });
}

export async function login(props: LoginFormSchema) {
    const zodResult = loginFormSchema.safeParse(props);
    if (!zodResult.success) {
        throw new Error('Zod validation failed: ' + zodResult.error.message);
    }
    const { acronym, username, password, token } = zodResult.data

    const ipAdress = headers().get('x-forwarded-for') ?? "127.0.0.1";
    if (!z.string().ip().safeParse(ipAdress).success) {
        throw new Error('Validation of Ip Address failed');
    }

    const ipLimit = await ipLimiter.get(ipAdress);
    if (ipLimit && ipLimit.remainingPoints <= 0) {
        await saveLoginAttempt({ ipAdress, acronym, username, withToken: !!token, successful: false, message: 'IP-Limit' });
        throw Error('Failed Login Attempt: IP-Limit');
    }

    const userCount = await userCounter.get(`${acronym}-${username}`);
    if (userCount && userCount.consumedPoints >= 5) {
        await setTimeout(5000); // waits for 5 seconds 
    }

    const assosiation = await getPrisma('').assosiation.findFirst({ where: { acronym } });
    if (!assosiation) {
        await ipLimiter.consume(ipAdress);
        await userCounter.consume(`${acronym}-${username}`);
        await saveLoginAttempt({ ipAdress, acronym, username, withToken: !!token, successful: false, message: "Assosiation not found" });
        throw Error('Failed Login Attempt: wrong Assosiation')
    }

    const prisma = getPrisma(assosiation.id);
    const dbUser = await prisma.user.findFirst({
        where: {
            assosiationId: assosiation.id,
            username,
        },
    });

    if (!dbUser || !await bcrypt.compare(password, dbUser.password)) {
        await ipLimiter.consume(ipAdress);
        await userCounter.consume(`${acronym}-${username}`);
        await saveLoginAttempt({ ipAdress, acronym, username, withToken: !!token, successful: false, message: dbUser ? "Wrong Credentials" : "User not found" });
        throw Error('Failed Login Attempt: wrong Credentials');
    }

    if (!token) {
        if (!dbUser.usingAuthenticator) {
            await sendEmailToken(dbUser.id, dbUser.email, prisma);
        }
        await saveLoginAttempt({ ipAdress, acronym, username, withToken: false, successful: true, message: "Authentication without 2FA successful" });
        return { message: "2FA Token required" };
    }

    if (!await verifyToken(dbUser.id, dbUser.usingAuthenticator, token, prisma)) {
        await failed2FACounter.consume(dbUser.id).then(async (limit) => {
            await saveLoginAttempt({ ipAdress, acronym, username, withToken: true, successful: false, message: "2FA Token invalid, tries remaining: " + limit.remainingPoints });
        }).catch(async () => {
            await saveLoginAttempt({ ipAdress, acronym, username, withToken: true, successful: false, message: "2FA Token invalid, USER BLOCKED" });
            await blockUser(dbUser.id, dbUser.email, prisma);
        });
        throw new Error("Faild Login Attempt: 2FA invalid");
    }

    // login
    await saveLoginAttempt({ ipAdress, acronym, username, withToken: true, successful: true, message: "Authentication without 2FA successful" });
}

async function verifyToken(userId: string, usingAuthenticator: boolean, token: string, prisma: PrismaClient) {
    if (usingAuthenticator) {
        const appdata = await prisma.towFactorAppUser.findFirst({ where: { userId, verified: true } });
        if (!appdata) throw Error('2FA-App not found');

        const totp = new TOTP({
            secret: appdata?.secret
        });

        const t = totp.validate({
            token,
            window: 3
        });
        console.log("🚀 ~ verifyToken ~ t:", t);

        return Number.isInteger(t);
    } else {
        const dbToken = await prisma.emailToken.findFirst({
            where: {
                token: +token,
                userId: userId,
                endOfLive: { gt: new Date() }
            }
        });
        return !!dbToken;
    }
}

async function sendEmailToken(userId: string, email: string, prisma: PrismaClient) {
    const token = generator.generate({
        length: 6, numbers: true, lowercase: false, uppercase: false
    })
    console.log("🚀 ~ sendEmailToken ~ token:", token)



    await prisma.emailToken.deleteMany({ where: { userId } });
    await prisma.emailToken.create({
        data: {
            token: +token,
            userId,
            endOfLive: moment().add(15, 'minute').toDate(),
        }
    });

    const transporter = getMailAgend();

    const t = await transporter.sendMail({
        to: email,
        subject: 'Ihr 2FA Token',
        html: `<div>
            <h1>Ihr 2FA Token für Uniformadminstration</h1>
            <p>${token}</p>

            <div>
                Sollten Sie selber nicht versucht haben sich anzumelden, melden Sie sich bei unserem Service und ändern ihr Passwort.
            </div>
        </div>`
    });
    console.log("🚀 ~ sendEmailToken ~ t:", t)
}

async function blockUser(id: string, email: string, prisma: PrismaClient) {
    await prisma.user.update({
        where: { id },
        data: { active: false }
    });

    const transporter = getMailAgend();

    const t = await transporter.sendMail({
        to: email,
        headers: {
            "x-priority": "1",
            "x-msmail-priority": "High",
            importance: "high",
        },
        subject: 'Account gespertt',
        html: `
            <div>
                <h1>Ihr Zugang wurde gesperrt</h1>
                <div>
                    Wir haben einen vermehrte Anzahl an fehlgeschlagenen zwei Faktor Authentifizierungen mitbekommen und zur sicherheit ihren Account gesperrt.
                    Bitte melden Sie sich bei Ihrem Administrator, um ihreren Zugang wieder frei zu schalten. 
                    Sollten Sie nicht selber die fehlgeschlagenen zwei Faktor Authentifizierungen ausgelöst haben, ist ihr Passwort komprimitiert. 
                    Ändern Sie Bitte Ihr Passwort umgehen auf allen Platformen auf denen Sie dieses nutzen.
                </div>
            </div>
        `
    });
}