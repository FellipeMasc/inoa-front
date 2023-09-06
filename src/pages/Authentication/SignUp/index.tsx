import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "../../../../node_modules/@hookform/resolvers/zod"
import "./styles.scss"
import { FC } from "react"
import { usePatch, usePost } from "utils/requests"
import { ativos } from "utils/ativos"
import { useNavigate } from "react-router-dom"

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

const cadastroSchema = z.object({
    email: z.string().email("formato irregular").nonempty("email vazio"),
    intervalo_checagem: z.string().regex(/^\d+$/, "o valor precisa ser um número positivo"),
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

type TCadastroSchema = z.infer<typeof cadastroSchema>

const Cadastro = () => {
    return (
        <div className="login-page w-100 mt-5 ">
            <Header />
            <InputFields />
            <div className="big-line mt-5" />
        </div>
    )
}

const Header: FC<{}> = () => {
    return (
        <div className="content-init">
            <h1 className="blue fw-700 fw-bold text-start lh-1 pb-0">Cadastre seu Email</h1>
            <p className="grayaf f24 lh-1 text-start pt-0 mb-4">Adicione seu email, intervalo de chequagem e ativos para serem monitorados.</p>
        </div>
    )
}

const InputFields: FC = () => {
    const {
        control,
        register,
        formState: { errors },
        handleSubmit,
    } = useForm<TCadastroSchema>({
        resolver: zodResolver(cadastroSchema),
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: "ativos",
    })

    const mutation = usePost("/signup")
    const mutation_schedule = usePost("enviar_ativos/schedule", {}, true)
    const navigate = useNavigate()

    return (
        <form
            className="form-cadastro"
            onSubmit={handleSubmit((data) => {
                console.log(data)
                mutation.mutate(
                    {
                        user: {
                            email: data.email,
                            password: "123456",
                            ativos: JSON.stringify(data.ativos),
                            intervalo_checagem: data.intervalo_checagem,
                        },
                    },
                    {
                        onSuccess: (resp) => {
                            alert("Cadastro feito com sucesso, você receberá atualizações no email, faça login para ver os seus ativos")
                            navigate("../")

                            mutation_schedule.mutate(
                                {
                                    comando: "start",
                                    interval: data.intervalo_checagem,
                                    email: data.email,
                                    ativos: JSON.stringify(data.ativos),
                                },
                                {
                                    onError: (err) => {
                                        console.log(err)
                                    },
                                }
                            )
                        },
                    }
                )
            })}
            noValidate
        >
            <div className="input-box">
                <input type="email" {...register("email")} className="form-login" placeholder="Email" />
                {errors.email && <span className="error-form">{errors.email.message}</span>}

                <input className="form-login" placeholder="Intervalo em minutos" type="number" {...register("intervalo_checagem")} />
                {errors.intervalo_checagem && <span className="error-form">{errors.intervalo_checagem.message}</span>}

                <button
                    type="button"
                    className="btn-form"
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
            </div>

            <button type="submit" className="btn-submit">
                CADASTRAR
            </button>
        </form>
    )
}

export default Cadastro
