"use client";

import { login } from "@/actions/authentication/login";
import { loginFormSchema, LoginFormSchema } from "@/zod/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormControl } from "react-bootstrap";
import { Form, useForm } from "react-hook-form";


export default function LoginPage() {
    const router = useRouter();
    const [invalidCredentials, setInvalidCredentials] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const searchParams = useSearchParams();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormSchema>({
        mode: "onChange",
        resolver: zodResolver(loginFormSchema)
    });
    const [step, setStep] = useState<0 | 1>(0);

    function onSubmit(data: LoginFormSchema) {
        if (step === 0) {
            setSubmitting(true);
            setInvalidCredentials(false);
            login(data).then((result) => {
                console.log(result);
                if (result.error) {
                    setInvalidCredentials(true);
                } else {
                    setStep(1);
                }
            }).catch(e =>
                console.error(e)
            ).finally(() => {
                setSubmitting(false);
            });
        } else {
            if (!data.token) return;
            setSubmitting(true);
            login(data).then((result) => {
                console.log("🚀 ~ login ~ result:", result)
                if (result.error || !result.logedIn) {
                    setInvalidCredentials(true);
                } else {
                    const returnUrl = searchParams.get('returnUrl');
                    if (returnUrl && urlWhiteList.includes(returnUrl)) {
                        return router.push(returnUrl);
                    }
                    router.push('/');
                }
            }).catch(e => {
                console.error(e)
            }).finally(() => {
                setSubmitting(false);
            });
        }
    }

    return (
        <div className="m-5 conatiner-xs justify-content-center row">
            <div className="col-3 bg-secondary-subtle ">
                <h1 className="text-center">Login</h1>
                <form className="" onSubmit={handleSubmit(onSubmit)}>
                    {(step === 0) &&
                        <div className="row m-4">
                            <label htmlFor="assosiation">Organisationskürzel</label>
                            <FormControl
                                type="text"
                                id="assosiation"
                                className="w-auto"
                                isInvalid={!!errors.acronym}
                                {...register('acronym')}
                            />
                            <label htmlFor="username">Nutzername</label>
                            <FormControl
                                type="text"
                                id="username"
                                className="w-auto"
                                isInvalid={!!errors.username}
                                {...register('username')}
                            />
                            <label htmlFor="password">Passwort</label>
                            <FormControl
                                type="password"
                                autoComplete="off"
                                autoCorrect="off"
                                className="w-auto"
                                isInvalid={!!errors.password}
                                {...register('password')}
                            />
                        </div>
                    }
                    {(step === 1) &&
                        <div>
                            <label htmlFor="token">Token</label>
                            <FormControl
                                type="text"
                                id="token"
                                autoComplete="off"
                                isInvalid={!!errors.token}
                                {...register('token')}
                            />
                        </div>
                    }
                    {invalidCredentials &&
                        <div className="text-danger">
                            {(step === 0) ?
                                "Nutzername oder Passwort sind Invalide" :
                                "Invalieder 2FA Token"
                            }
                        </div>
                    }
                    <div className="row mx-4 justify-content-end">
                        <button
                            type="submit"
                            className="col col-auto btn btn-primary"
                            disabled={submitting}
                        >
                            {(step == 0) ? "Weiter" : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const urlWhiteList = [
    "/", "/admin/user", "account"
]
