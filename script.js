// 1. O MOTOR MATEMÁTICO (Sua obra-prima)

function registroVendas(totalVendas) {
    const meta = 7500;

    if (totalVendas <= 7500) {
        let comissaoEsperadaMeta = (totalVendas * 50) / 100;
        return comissaoEsperadaMeta;
    } else {
        let comissaoEsperadaMeta = (meta * 50) / 100;
        let superMeta = totalVendas - meta;
        let comissaoEsperadaSuper = (superMeta * 80) / 100;

        let comissaoTotal = comissaoEsperadaMeta + comissaoEsperadaSuper;
        return comissaoTotal;
    }
}

let campoCliente = document.getElementById("nome-cliente")
let campoData = document.getElementById("data-venda")
let campoVenda = document.getElementById("valor-da-venda")
let campoDesconto = document.getElementById("meses-desconto")

let btnSalvar = document.getElementById("botao-salvar")
let campoResult = document.getElementById("texto-resultado")


