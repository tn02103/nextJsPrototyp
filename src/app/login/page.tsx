"use client";

import { login } from "@/actions/authentication/login";
import { loginFormSchema, LoginFormSchema } from "@/zod/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormControl } from "react-bootstrap";
import { Form, useForm } from "react-hook-form";


export default function LoginPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormSchema>({
        mode: "onChange",
        resolver: zodResolver(loginFormSchema)
    });
    const [step, setStep] = useState<0 | 1>(0);

    function onSubmit(data: LoginFormSchema) {
        if (step === 0) {
            console.log(data);
            login(data).then(() => {
                setStep(1);
            }).catch(e => console.error(e));
        } else {
            if (!data.token) return;
            login(data).then(() => {
                router.push('/');
            }).catch(e => console.error(e));
        }
    }
    console.log(errors);
    return (
        <div className="m-5 conatiner-xs justify-content-center row">

            <div className="col-3 bg-secondary-subtle ">
                <h1 className="text-center">Login</h1>
                <form className="" onSubmit={handleSubmit(onSubmit)}>
                    {(step === 0) &&
                        <div className="row m-4">
                            <label htmlFor="assosiation">Organisationkürzel</label>
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
                            <input
                                type="text"
                                id="token"
                                autoComplete="off"
                                {...register('token')}
                            />
                        </div>
                    }
                    <div className="row mx-4 justify-content-end">
                        <button type="submit" className="col col-auto btn btn-primary">{(step==0)?"Weiter":"Login"}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}