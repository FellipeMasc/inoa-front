import * as React from "react"
import { Routes, Route, Outlet, useNavigate } from "react-router-dom"
import "./App.scss"
import axios from "axios"
import { useState, useEffect } from "react"
import { logout, useClient } from "utils/requests"
import Login from "pages/Authentication/SignIn"
import Cadastro from "pages/Authentication/SignUp"
import DashBoard from "pages/DashBoard"

export default function App() {
    const [authenticated, setAuthenticated] = useState(false)
    const client = useClient()
    const navigate = useNavigate()

    useEffect(() => {
        const user_id = localStorage.getItem("user_id")
        const request_authorization = localStorage.getItem("request_authorization")
        if (user_id && request_authorization) {
            axios.defaults.params = {
                user_id: user_id,
            }
            axios.defaults.headers.common = {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: request_authorization,
            }
            setAuthenticated(true)
        }
    }, [])

    client.setDefaultOptions({
        queries : {
            onError : (e:any) => {
                if (e.response?.status === 401) logout(setAuthenticated)
            }
        }
    })

    return (
        <Routes>
            <Route
                path="/"
                element={
                    authenticated && (
                        <>
                            <div className="topbar">
                                <span className="f20">Caso queira se desconectar clique no botão ao lado</span>
                                <button type="button" onClick={() => logout(setAuthenticated, navigate)}>Sair</button>

                            </div>
                            <Outlet></Outlet>
                        </>
                    )
                }
            >
                {!authenticated && (
                    <>
                        <Route
                            path="/"
                            element={<Login setAuthenticated={setAuthenticated}></Login>}
                        ></Route>
                        <Route path="/cadastro" element={<Cadastro></Cadastro>}></Route>
                    </>
                )}

                {authenticated && <Route path="/" element={<DashBoard setAuthenticated={setAuthenticated}></DashBoard>}></Route>}
            </Route>
        </Routes>
    )
}
