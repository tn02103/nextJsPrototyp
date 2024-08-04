import nodemailer from "nodemailer"

export const getMailAgend = () => {
    return nodemailer.createTransport({
        port: Number(process.env.EMAIL_PORT),
        host: process.env.EMAIL_HOST,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    })
}

export function encodeHTML(str: string): string {
    return str.replace(/&/g, '&')
              .replace(/</g, '<')
              .replace(/>/g, '>')
              .replace(/"/g, '"')
              .replace(/'/g, '\'');
}
