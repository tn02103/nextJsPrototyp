"use server"

import { AuthRole } from "@/lib/authRole";
import { getPrisma } from "@/lib/db";
import { encodeHTML, getMailAgend } from "@/lib/mailAgend";
import { genericSANoDataValidator, genericSAValidator } from "@/lib/serverActionValidation";
import { userAdministrationFormSchema } from "@/zod/user";
import { hash } from "bcrypt";
import { z } from "zod";


export const getUserList = () => genericSANoDataValidator({
    requiredRole: AuthRole.admin
}).then(({ assosiation }) => {
    return getPrisma(assosiation.id).user.findMany({
        orderBy: { username: "desc" }
    });
});

const createUserPropSchema = z.object({
    password: z.string(),
    sendMail: z.boolean(),
    data: userAdministrationFormSchema.extend({
        password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
    }),
});
type createUserPropSchema = z.infer<typeof createUserPropSchema>;
export const createUser = (props: createUserPropSchema) => genericSAValidator<createUserPropSchema>({
    requiredRole: AuthRole.admin,
    data: props,
    schema: createUserPropSchema,
    reauthenticate: "password"
}).then(async ([user, { data, sendMail }]) => getPrisma(user.assosiation.id).$transaction(async (client) => {
    const list = await client.user.findMany();

    if (list.find(u => u.username === data.username)) {
        throw new Error('Could not create User. Username allready in use');
    }

    const unhashedPassword = data.password;
    data.password = await hash(data.password, 12)
    const newUser = await client.user.create({
        data: {
            ...data,
            assosiationId: user.assosiation.id,
        }
    });

    if (sendMail) {
        const transporter = getMailAgend();

        await transporter.sendMail({
            to: data.email,
            subject: 'Neuer Nutzer für NextJs-Prototyp',
            html: `
            <div>
                <h1>Neuer Zugang </h1>
                <p>Sie haben einen neuen Zugang zu NextJs-Prototyp bekommen.</p>
                Ihr Zugansdaten: <br/>
                Nutzername: ${encodeHTML(data.username)} <br/>            
                Password: ${encodeHTML(unhashedPassword)} <br/>

                Bitte ändern Sie Ihr Passwort unverzüglich nach Ihrem ersten Login.
            </div>`
        });
    }
    return newUser;
}));

const updateUserPropSchema = z.object({
    id: z.string().uuid(),
    data: userAdministrationFormSchema,
});
type updateUserPropSchema = z.infer<typeof updateUserPropSchema>
export const updateUser = (props: updateUserPropSchema) => genericSAValidator<updateUserPropSchema>({
    requiredRole: AuthRole.admin,
    data: props,
    schema: updateUserPropSchema
}).then(async ([user, { id, data }]) => getPrisma(user.assosiation.id).$transaction(async (client) => {
    const list = await client.user.findMany();

    if (list.find(u => u.username === data.username && u.id !== id)) {
        throw new Error('Could not update User. Username allready in use');
    }

    const updateData: any = data;
    if (user.id === id) {
        delete updateData.active;
        delete updateData.role;
    }

    await client.user.update({
        where: { id },
        data: updateData,
    });
}));

const resetPasswordPropsSchema = z.object({
    userId: z.string().uuid(),
    newPassword: z.string(),
    password: z.string(),
    sendMail: z.boolean(),
});
type resetPasswordPropsSchema = z.infer<typeof resetPasswordPropsSchema>;
export const resetPassword = (props: resetPasswordPropsSchema): Promise<void> => genericSAValidator<resetPasswordPropsSchema>({
    requiredRole: AuthRole.admin,
    data: props,
    schema: resetPasswordPropsSchema,
    reauthenticate: "password"
}).then(async ([user, data]) => getPrisma(user.assosiation.id).$transaction(async (client) => {
    if (user.id === data.userId)
        throw Error('This method is not made to change the own Password');

    const dbUser = await client.user.update({
        where: { id: data.userId },
        data: {
            password: await hash(data.newPassword, 12),
        }
    });

    if (data.sendMail) {
        const transporter = getMailAgend();

        await transporter.sendMail({
            to: dbUser.email,
            subject: 'Neues Password',
            html: `
            <div>
                <h1>Ihr Password wurde zurückgesetzt </h1>
                <p>Ihr Password wurde von Ihrem Adminsitrator zurückgesetzt. <br/>
                    Bitte ändern sie diese direkt nach dem ersten Login <br/> </p>           
                Password: <p>${encodeHTML(data.newPassword)}</p> <br/>

                Bitte ändern Sie Ihr Passwort unverzüglich nach Ihrem ersten Login.
            </div>`
        });
    }

}));


export const deleteUser = (props: string): Promise<void> => genericSAValidator({
    requiredRole: AuthRole.admin,
    data: props,
    schema: z.string().uuid(),
}).then(async ([user, userId]) => getPrisma(user.assosiation.id).$transaction(async (client) => {
    if (user.id === userId)
        throw new Error('Could not delete User-instance of User');

    await client.user.delete({
        where: { id: userId }
    });
}));