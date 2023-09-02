import React, { FC } from "react"
import { useNavigate } from "react-router-dom"
import { logout, useGet } from "utils/requests"
import ApexChart from "react-apexcharts"
import ReactApexChart from "react-apexcharts"
import { ApexOptions } from "apexcharts"
import "./style.scss"

export default function DashBoard({ setAuthenticated }: { setAuthenticated: Function }) {
    const navigate = useNavigate()

    const { isLoading, data, isError } = useGet("enviar_ativos")
    console.log(data)
    return (
        <>
            {isLoading && <img alt="" src="/loading.svg" width={40}></img>}

            {isError && <div>ERRO</div>}
            {!isLoading && !isError && (
                <>
                <h1 className="blue fw-700 fw-bold lh-1 pb-0">DashBoard Ativos</h1>
                <div className="dashboard">
                    {data.data_series.map((serie: any, index: number) => {
                        console.log(serie)
                        const series = serie.data.map((e: any) => {
                            return {
                                x: new Date(e.x * 1000),
                                y: e.y,
                            }
                        })
                        const ativo_info = data.ativos.find((item : any) => item.nome_ativo === serie.ativo_nome)
                        const series_parsed = [{ data: [...series] }]

                        const options: ApexOptions = {
                            chart: {
                                type: "candlestick",
                                height: 350,
                            },
                            title: {
                                text: `Gráfico do ativo ${serie.ativo_nome} durante o dia`,
                                align: "left",
                            },
                            xaxis: {
                                type: "datetime",
                            },
                            yaxis: {
                                tooltip: {
                                    enabled: true,
                                },
                            },
                            //@ts-ignore
                            series: series_parsed,
                            plotOptions: {
                                candlestick: {
                                    colors: {
                                        upward: "#3C90EB",
                                        downward: "#DF7D46",
                                    },
                                    wick: {
                                        useFillColor: true,
                                    },
                                },
                            },
                        }
                        return (
                            //@ts-ignore
                            <div className="graf-field" key={index}>
                                <div className="header">
                                    <img src={serie.ativo_logo}></img>
                                    <span>Ativo : {ativo_info.nome_ativo}</span>
                                    <span>Preço de compra : {ativo_info.preco_compra} R$</span>
                                    <span className="a">Preço de venda : {ativo_info.preco_venda} R$</span>
                                </div>
                                <ApexChart
                                    series={series_parsed}
                                    options={options}
                                    height={400}
                                    width={700}
                                />
                            </div>
                                )
                            })}
                            </div>
                </>
            )}
            <h1 className="blue fw-700 fw-bold lh-1 pb-0">Espaço para o usuário modificar o preço de compra e venda e cancelar o recebimento de email</h1>
            {/* NotImplementedYet */}
            <h1>NotImplementedYet</h1>
        </>
    )
}
