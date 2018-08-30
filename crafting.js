var names;
var craftingItems;
var currentIngredientShown;
var recursionCount = 0;

$(document).ready(function () {
    console.log("Hi");



    $.ajax({
        url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
            + "/items.json"
    }).then(function (data) {
        console.log(data.items[0]);
        craftingItems = data.items;
        names = new Array();
        for (i = 0; i < data.items.length; i++) {
            names.push({
                "value": data.items[i].name,
                "data": i
            });
        }
        $('#autocomplete').autocomplete({
            lookup: names,
            onSelect: function (suggestion) {
                showItem(suggestion.value);
            }
        });
        input = document.getElementById('autocomplete');
        searchBtn = document.getElementById('searchBtn');
        searchBtn.onclick = function () {
            var name = document.getElementById('autocomplete').value;
            showItem(name);
        };

        // Execute a function when the user releases a key on the keyboard
        input.addEventListener("keyup", function (event) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Trigger the button element with a click
                searchBtn.click();
            }
        });

        /* document.getElementsByClassName('itemLink').onclick = function(){
            name = this.textContent;
            showItem(name);
        } */

        /* $('.itemLink').click(function() {
            alert('hohoho');
          }); */

        /* jQuery(document).ready(function ($) {
            $(".itemLink").click(function () {
                debugger;
                var name = $(this).data("href");
                showItem(name);
            });
        }); */



    });



});

function showItem(name) {
    if (currentIngredientShown == name) {
        return;
    }


    currentIngredientShown = name;


    var item;
    item = getItemByName(name);
    if (item == null) {
        return;
    }
    document.getElementById('autocomplete').value = "";

    $('#mainCard').fadeOut(400, function () {
        document.getElementById('itemName').textContent = name;
        document.getElementById('priceTag').textContent = "Price: " + item.price.toLocaleString() + " Units";
        $('#mainCard').fadeIn();
    });

    ingLen = item.ingredients.length;
    $('#craftingCard').fadeOut(400, function () {
        $('.table-active').remove();
        var tableContent = "";
        if (ingLen > 0) {
            var i;
            for (i = 0; i < ingLen; i++) {
                var ing = item.ingredients[i];
                $newRow = $('#templateCraftingRow').clone();
                $newRow.attr("class", "table-active itemLink");
                $newRow.find('#ingName').text(ing.name);
                $newRow.find('#ingPrice').text(getItemByName(ing.name).price.toLocaleString() + " Units");
                $newRow.attr("id", "ing");
                $newRow.attr("data-href", ing.name);
                $newRow.find('#ingQuantity').text("x" + ing.count);

                $('#craftingTable').append($newRow);

            }
            $('#craftingCard').fadeIn(400, function () {
                $(".itemLink").click(function () {
                    var name = $(this).data("href");
                    showItem(name);
                });
            });
        }
    });

    $('#shoppingListCard').fadeOut(400, function () {
        var sList = new Array();
        getShoppingList(name, 1, sList, function () {
            console.log(sList);
            var i;
            var total = 0;
            for (i = 0; i < sList.length; i++) {
                $newShoppingRow = $('#templateShoppingRow').clone();
                $newShoppingRow.find('.shopName').text(sList[i].name);
                $newShoppingRow.find('.shopPrice').text(getItemByName(sList[i].name).price + " Units");
                $newShoppingRow.find('.shopCount').text("x" + sList[i].quantity);
                $newShoppingRow.find('.shopCount').attr('data-count', sList[i].quantity);
                $newShoppingRow.attr('data-href', sList[i].name);
                $newShoppingRow.removeAttr("id");
                $newShoppingRow.attr("class", "table-active itemLink");
                var itemTotal = getItemByName(sList[i].name).price * sList[i].quantity;
                total += itemTotal;
                $newShoppingRow.find('.shopItemTotal').text(itemTotal.toLocaleString() + " Units");
                $newShoppingRow.find('.shopItemTotal').attr('data-itemTotal', itemTotal);

                $('#shoppingTable').append($newShoppingRow);
            }
            var totalLabel = document.getElementById("shopTotal");
            totalLabel.innerHTML = "Total: " + total.toLocaleString() + " Units";
            inputAmount = document.getElementById("inputAmount");
            inputAmount.value = 1;
            inputAmount.addEventListener("change", function () {
                console.log("amount changed");
                $('.shopCount').each(function (i, obj) {
                    var count;
                    count = obj.getAttribute('data-count');
                    count *= inputAmount.value;
                    obj.textContent = "x" + count;
                });
                var total = 0;
                $('.shopItemTotal').each(function (i, obj) {
                    var itemTotal;
                    itemTotal = obj.getAttribute('data-itemTotal');
                    itemTotal *= inputAmount.value;
                    total += itemTotal;
                    obj.textContent = itemTotal.toLocaleString() + " Units";
                })
                var totalLabel = document.getElementById("shopTotal");
                totalLabel.innerHTML = "Total: " + total.toLocaleString() + " Units";
                console.log(total);
            });

            $('#shoppingListCard').fadeIn(400, function () {
                $(".itemLink").click(function () {
                    var name = $(this).data("href");
                    showItem(name);
                });
            });
        });



    });


}

function getItemByName(name) {
    var i;
    for (i = 0; i < craftingItems.length; i++) {
        if (craftingItems[i].name == name) {
            return craftingItems[i];
        }
    }
    return null;
}

class ingPair {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    }
    multiply(amount) {
        return new ingPair(this.name, this.quantity * amount);
    }
}

function getShoppingList(itemName, itemQuantity, shoppingList, callback) {
    recursionCount++;
    var item = getItemByName(itemName);
    if (item.ingredients.length > 0) {
        var i;
        for (i = 0; i < item.ingredients.length; i++) {
            var currentIngredient = item.ingredients[i];
            getShoppingList(currentIngredient.name, itemQuantity * currentIngredient.count, shoppingList);
        }
    } else {
        addToShoppingList(new ingPair(itemName, itemQuantity), shoppingList);
        // shoppingList.push(new ingPair(itemName, itemQuantity));
    }
    recursionCount--;
    if (recursionCount == 0 && callback) {
        callback();
    }
}

function addToShoppingList(pair, shoppingList) {
    var i;
    for (i = 0; i < shoppingList.length; i++) {
        if (shoppingList[i].name == pair.name) {
            shoppingList[i].quantity += pair.quantity;
            return;
        }
    }
    shoppingList.push(pair);
}