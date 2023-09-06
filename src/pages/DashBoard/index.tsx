import React, { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logout, useGet, usePatch, usePost } from "utils/requests"
import ApexChart from "react-apexcharts"
import ReactApexChart from "react-apexcharts"
import { ApexOptions } from "apexcharts"
import { z } from "zod"
import { zodResolver } from "../../../node_modules/@hookform/resolvers/zod"
import { ativos } from "utils/ativos"
import "./style.scss"
import { useFieldArray, useForm } from "react-hook-form"
import { QueryClient, useQueryClient } from "@tanstack/react-query"

function uniqueZArray(
    ZArray: {
        nome_ativo: string
        preco_venda: string
        preco_compra: string
    }[]
) {
    const ativos = ZArray.map((item) => {
        return item.nome_ativo
    })
    return new Set(ativos).size === ZArray.length
}

const cadastroPatchSchema = z.object({
    ativos: z
        .array(
            z.object({
                nome_ativo: z
                    .string()
                    .nonempty("Coloque o nome do ativo")
                    .toUpperCase()
                    .refine((ativo) => ativos.includes(ativo) === true, {
                        message: "Não há ativo com esse nome",
                    }),
                preco_venda: z
                    .string()
                    .nonempty("Coloque o preço de venda")
                    .regex(/\d+(\.\d+)?/, "precisa estar no formato dígito.dígito"),
                preco_compra: z
                    .string()
                    .nonempty("Coloque o preço de compra")
                    .regex(/\d+(\.\d+)?/, "precisa estar no formato dígito.dígito"),
            })
        )
        .min(1, "selecione pelo menos 1 ativo")
        .refine((items) => uniqueZArray(items) === true, {
            message: "Coloque apenas 1 ativo por campo",
        }),
})

type TCadastroPatchSchema = z.infer<typeof cadastroPatchSchema>

export default function DashBoard({ setAuthenticated }: { setAuthenticated: Function }) {
    const navigate = useNavigate()
    const {
        control,
        register,
        setValue,
        formState: { errors },
        handleSubmit,
    } = useForm<TCadastroPatchSchema>({
        resolver: zodResolver(cadastroPatchSchema),
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: "ativos",
    })
    const queryClient = useQueryClient()
    const { isLoading, data, isError, refetch, isFetching } = useGet("enviar_ativos")
    const mutation = usePost("enviar_ativos/schedule", {}, true)
    const mutation_patch = usePatch("enviar_ativos/" + localStorage.getItem("user_id"), {}, true)
    console.log(data)

    useEffect(() => {
        if (!isLoading) {
            setValue("ativos", data.ativos)
        }
    }, [isFetching, isLoading])

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
                            const ativo_info = data.ativos.find((item: any) => item.nome_ativo === serie.ativo_nome)
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
                                    <ApexChart series={series_parsed} options={options} height={400} width={700} />
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
            <div className="footer">
                <h1 className="blue fw-700 fw-bold lh-1 pb-0">Espaço para o usuário cancelar o recebimento de email</h1>
                <button
                    type="button"
                    onClick={() => {
                        mutation.mutate({
                            comando: "pause",
                        })
                    }}
                >
                    Pausar Notificação
                </button>
                <button
                    type="button"
                    onClick={() => {
                        mutation.mutate({
                            comando: "resume",
                        })
                    }}
                >
                    Retomar Notificação
                </button>
            </div>
            <h1 className="blue fw-700 fw-bold lh-1 pb-0">Espaço para o usuário modificar os ativos</h1>
            <form
                noValidate
                onSubmit={handleSubmit((dataForm) => {
                    console.log(dataForm)
                    mutation_patch.mutate(
                        {
                            ativos: JSON.stringify(dataForm.ativos),
                        },
                        {
                            onSuccess: () => {
                                alert("Mudança feita com sucesso!")
                                mutation.mutate(
                                    {
                                        comando: "restart",
                                    },
                                    {
                                        onSuccess: () => {
                                            queryClient.invalidateQueries({queryKey: ["enviar_ativos"]})
                                        },
                                    }
                                )
                            },
                        }
                    )
                })}
            >
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        append({ nome_ativo: "", preco_compra: "", preco_venda: "" })
                    }}
                >
                    Adicionar Ativo
                </button>
                {fields.map((item, index) => {
                    return (
                        <div key={item.id} className="ativos-list">
                            <div className="inputs">
                                <div className="input-group">
                                    <input className="input-array" type="text" {...register(`ativos.${index}.nome_ativo`)} placeholder="Nome do Ativo" />

                                    {errors?.ativos?.[index]?.nome_ativo && <span>{errors?.ativos?.[index]?.nome_ativo?.message}</span>}
                                </div>

                                <div className="input-group">
                                    <input className="input-array" type="text" {...register(`ativos.${index}.preco_venda`)} placeholder="preço de venda" />

                                    {errors?.ativos?.[index]?.preco_venda && <span>{errors?.ativos?.[index]?.preco_venda?.message}</span>}
                                </div>

                                <div className="input-group">
                                    <input className="input-array" type="text" {...register(`ativos.${index}.preco_compra`)} placeholder="preço de compra" />

                                    {errors?.ativos?.[index]?.preco_compra && <span>{errors?.ativos?.[index]?.preco_compra?.message}</span>}
                                </div>
                            </div>

                            <button className="btn-form" onClick={() => remove(index)}>
                                Remover Ativo
                            </button>
                        </div>
                    )
                })}
                {errors?.ativos && <span>{errors?.ativos?.message}</span>}

                <button type="submit" className="btn-submit">
                    CADASTRAR
                </button>
            </form>
        </>
    )
}
