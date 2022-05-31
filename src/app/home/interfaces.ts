export interface Dados {
    numEmp : number,
    tipCol : number,
    numCad : number
}

export interface Gerais{
    datRef: String,
    colaboradores: Dados
}

export interface Aperfeicoamento{
    nomCua: String,
    desCua: String,
    codCua: Number,
    temReq: String,
    seqImp: Number
}

export interface Retorno{
    erroExecucao: Object,
    aperfeicoamento: Array<Aperfeicoamento>
}
