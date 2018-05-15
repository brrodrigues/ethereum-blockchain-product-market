App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    web3HttpProvider: "http://localhost:7545",

    init: function () {

        /*var articleRow = $("#articleRow");
        var articleTemplate = $("#articleTemplate");

        articleTemplate.find(".panel-title").text("Article 1");
        articleTemplate.find(".article-description").text("Description 1");
        articleTemplate.find(".article-price").text("10.23");
        articleTemplate.find(".article-seller").text("0x1234567891234567890");

        articleRow.append(articleTemplate.html());
*/
        return App.initWeb3();
    },

    displayAccountInfo: function () {
        $('#account').text(App.account);
        console.log("Loading account information...");
        web3.eth.getCoinbase(function (err, account) {
            console.log("loaded.");
            if (err === null) {
                console.log("loaded without error");
                App.account = account;
                $('#account').text(account);

                web3.eth.getBalance(account, function (err, balance) {
                    if (err === null)
                        $('#accountBalance').text(web3.fromWei(balance, "ether") + 'ETH');
                });
            }
        });
    },

    initWeb3: function () {

        if (typeof web3 !== 'undefined') {
            //Reutilizando o provedor existente do web3
            App.web3Provider = web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider(App.web3HttpProvider);
        }

        web3 = new Web3(App.web3Provider);

        App.displayAccountInfo();

        return App.initContract();
    },

    reloadArticles: function () {

        App.displayAccountInfo();

        var articleRow = $('#articleRow');
        var articleTemplate = $('#articleTemplate');

        articleRow.empty();

        App.contracts.Produto.deployed().then(function (instance) {
            return instance.getProduto(); //Metodo localizado dentro do contrato Produto.sol
        }).then(function (article) {

            if (article[0] == 0x0) {
                return;
            }

            var articleRow = $('#articleRow');

            articleTemplate.find('.panel-title').text(article[1]);
            articleTemplate.find('.article-description').text(article[2]);
            articleTemplate.find('.article-price').text(web3.fromWei(article[3], 'ether'));

            var seller = article[0];

            if (seller == App.account) {
                seller = 'Eu';
            }

            articleTemplate.find('.article-seller').text(seller);

            articleRow.append(articleTemplate.html());

        }).catch(function (err) {
            console.error(err);
        });

        return undefined;
    },

    venderProduto: function () {

        console.log("Enviando venda de produto para rede ethereum");

        let articleName = $('#article_name').val();
        let articleDescription = $('#article_description').val();
        let articlePrice = $('#article_price').val();

        if (articleName.trim() == '' || articlePrice == 0) {
            console.log("Nome " + articleName);
            console.log("Preco " + articlePrice);
            console.log("Campos obrigatorio nulo ou vazios ");
            return false;
        }

        App.contracts.Produto.deployed().then(function (instance) {
            return instance.sellArticle(
                articleName, articleDescription, web3.toWei(parseFloat(articlePrice || 0), 'ether'),
                {from: App.account, gas: 500000});
        })
            .then(function (results) {
                App.reloadArticles();
            })
            .catch(function (err) {
                console.error('Erro anunciar um produto', err);
            })

    },

    initContract: function () {
        //Esse Produto.json refere-se ao arquivo gerado ao executar o comando truffle compile --all --reset --network ganache
        $.getJSON('Produto.json', function (list) {
            App.contracts.Produto = TruffleContract(list);
            App.contracts.Produto.setProvider(App.web3Provider);

            return App.reloadArticles();
        });
    },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
