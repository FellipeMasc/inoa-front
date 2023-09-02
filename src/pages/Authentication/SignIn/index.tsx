import * as React from "react"
import { FC, useEffect, useState } from "react"
import "./styles.scss"

import Axios from "axios"
import { logout, useClient, usePost } from "utils/requests"

import jwt_decode from "jwt-decode"
import { Navigate, useNavigate } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "../../../../node_modules/@hookform/resolvers/zod"

const userFormSchema = z.object({
    email: z.string().email(),
})

type TUserFormSchema = z.infer<typeof userFormSchema>

const Login: FC<{ setAuthenticated: Function }> = ({ setAuthenticated }) => {
    const client = useClient()
    const navigate = useNavigate()

    useEffect(() => {
        client.removeQueries()
    }, [])

    client.setDefaultOptions({
        queries: {
            onError: (e: any) => {
                if (e.response?.status === 401) logout(setAuthenticated, navigate)
            },
        },
    })

    return (
        <div className="login-page w-100 mt-5 ">
            <Header />
            <InputFields setAuthenticated={setAuthenticated} />
            <div className="big-line mt-5" />
            <Help />
        </div>
    )
}

const Header: FC<{}> = () => {
    return (
        <div className="content-init">
            <h1 className="blue fw-700 fw-bold text-start lh-1 pb-0">DashBoard Ativos</h1>
            <p className="grayaf f14 lh-1 text-start pt-0 mb-4">
                Coloque o email que você cadastrou
            </p>
        </div>
    )
}

const InputFields: FC<{ setAuthenticated: Function }> = ({ setAuthenticated }) => {
    const mutation = usePost("login", {}, true)

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<TUserFormSchema>({
        resolver: zodResolver(userFormSchema),
    })

    return (
        <form
            onSubmit={handleSubmit((data) => {
                console.log(data)
                mutation.mutate(
                    {
                        user: {
                            email: data.email,
                            password: "123456",
                        },
                    },
                    {
                        onSuccess: (response) => {
                            if (!response.data.user) {
                                console.log("ops")
                                alert("Login mal sucedido")
                                return
                            }

                            Axios.defaults.headers.common = {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                Authorization: response.data.token
                            }

                            localStorage.setItem("request_authorization", response.data.token)

                            localStorage.setItem("user_id", response.data.user.id)
                            setAuthenticated(true)
                        },
                    }
                )
            })}
        >
            <div className="input-box col-12 mb-3">
                <input
                    type="email"
                    {...register("email")}
                    className="form-login"
                    placeholder="Email"
                />
            </div>
            {error && <div className="red text-start f12">Credenciais inválidas.</div>}
            <div className="">
                <button type="submit" className="btn btn-blue mt-4">
                    ENTRAR{" "}
                    {mutation.isLoading && <img alt="" src="/assets/loading.svg" width={24} />}
                </button>
            </div>
        </form>
    )
}

const Symbols: FC<{}> = () => {
    return (
        <div className="d-flex justify-content-center align-items-center mt-4 pb-5 gap-4">
            <a
                href="https://www.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="card d-flex align-items-center justify-content-center p-3"
            >
                <img src="/assets/google.svg" alt="" />
            </a>
            <a
                href="https://pt-br.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="card d-flex align-items-center justify-content-center p-3"
            >
                <img src="/assets/facebook.svg" alt="" />
            </a>
        </div>
    )
}

const Help: FC<{}> = () => {
    const navigate = useNavigate()
    return (
        <div className="d-flex justify-content-center f12 fw-500 flex-column mt-5 mb-2">
            <button className="btn btn-form" onClick={() => navigate("/cadastro")}>
                Não possui ativos cadastrados?
            </button>
        </div>
    )
}

export default Login
