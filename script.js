// 1. O MOTOR MATEMÁTICO (Sua obra-prima)

function registroVendas(totalVendas) {
    const meta = 7500;

    if (totalVendas <= 7500) {
        let comissaoEsperadaMeta = (totalVendas * 40) / 100;
        return comissaoEsperadaMeta;
    } else {
        let comissaoEsperadaMeta = (meta * 40) / 100;
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

btnSalvar.addEventListener("click", function() {
    event.preventDefault();

    // 1. Cria a fichinha com os dados da tela
    let dadosDaVenda = {
        cliente: campoCliente.value,
        data: campoData.value,
        valor: Number(campoVenda.value),
        mesesDesconto: Number(campoDesconto.value)
    };

    // 2. Busca o que já estava salvo ou cria uma lista vazia
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];

    // 3. Adiciona a venda nova na lista
    vendasSalvas.push(dadosDaVenda);

    // 4. Salva tudo de volta no navegador
    localStorage.setItem("listaVendas", JSON.stringify(vendasSalvas));

    console.log(dadosDaVenda);

    alert("Venda registrada com sucesso!");
});