class FoodItem {
    constructor(peopleOnItem, price, itemName) {
        this.peopleOnItem = peopleOnItem;
        this.price = price;
        this.itemName = itemName;
    }
}

class ProgramState {
    constructor() {
        this.names = [];
        this.tip = 0;
        this.tax = 0;
        this.foodItems = [];
        this.individualItems = [];
        this.sharedItems = [];
        this.total = 0;
        this.personalTotals = {};
        this.personalPercentages = {};
    }

    initPersonalInfo() {
        for (const name of this.names) {
            this.personalTotals[name] = 0;
            this.personalPercentages[name] = 0;
        }
    }

    calulateIndividualTotals() {
        for (const item of this.individualItems) {
            this.personalTotals[item.peopleOnItem[0]] += item.price;
        }
    }

    addSharedCosts() {
        for (const item of this.sharedItems) {
            let totalForEach = (item.price / item.peopleOnItem.length)
            for (const person of item.peopleOnItem) {
                this.personalTotals[person] += totalForEach;
            }
        }
    }

    calculatePersonalPercentages() {
        for (const name of this.names) {
            let percent = (this.personalTotals[name] / this.total);
            this.personalPercentages[name] = percent
        }
    }

    addTipAndTaxProrated() {
        for (const name of this.names) {
            this.personalTotals[name] += ((this.tip * this.personalPercentages[name]) + (this.tax * this.personalPercentages[name]))
        }
    }

    calculateTotals() {
        this.sortFoodItems();
        this.initPersonalInfo();
        this.calulateIndividualTotals();
        this.addSharedCosts();
        this.calculatePersonalPercentages();
        this.addTipAndTaxProrated();
    }

    sortFoodItems() {
        for (const item of this.foodItems) {
            if (item.peopleOnItem.length === 1) {
                this.individualItems.push(item);
            } else {
                this.sharedItems.push(item);
            }
        }
    }

    processNameTipTax(rawNameData, tipString, taxString) {
        this.names = rawNameData.split(", ");
        this.tip = Number(tipString);
        this.tax = Number(taxString);
    }

    processItemData(context) {
        return function() {
            let tileList = $(".tile-outline");
            let foodList = []

            for (const tile of tileList) {
                let foodName = tile.children[0].children[0];
                foodName = $(foodName).text();
                let foodPrice = tile.children[0].children[1];
                foodPrice = $(foodPrice).text().substring(0, $(foodPrice).text().length - 1);

                let names = [];
                for (const input of $(tile).children(".name-checks").children().children()) {
                    if (input.checked) {
                        names.push(input.value);
                    }
                }

                foodList.push(new FoodItem(names, Number(foodPrice), foodName));
            }
            context.foodItems = foodList;
            context.total = Number($("#total-number").text());
        }
    } 
}

class ProgramUI {

    constructor(programState) {
        $(".primary-box").hide(0);
    }

    submitNameList(context) {
        return function() {
            $(".intro-box").css({"opacity": "1", "display": "flex"}).show(200).animate({opacity:0});
            $(".intro-box").hide(300);
            $(".primary-box").show(500);
            console.log("hello");
            
            context.processNameTipTax($("#people-names").val(), $("#tip").val(), $("#tax").val());
        }
    }

    createFoodItemTile(context) {
        return function() {
            let foodName = $("#food-name").val();
            let foodPrice = $("#food-price").val();
            let nameList = context.names;

            $("#food-name").val("");
            $("#food-price").val(0);

            let tileOutline = document.createElement("div");
            $(tileOutline).addClass("tile-outline");

            let foodInfo = document.createElement("div");
            $(foodInfo).addClass("food-info");

            $(foodInfo).append("<p>" + foodName + "</p>", "<p>" + foodPrice + "$" + "</p>");
            $(tileOutline).append(foodInfo);

            let nameChecks = document.createElement("div");
            $(nameChecks).addClass("name-checks");

            for (const name of nameList) {
                let nameLabel = document.createElement("label");
                $(nameLabel).append(name);

                let checkInput = document.createElement("input");
                checkInput.type = "checkbox"
                checkInput.value = name;

                $(nameLabel).append(checkInput);
                nameChecks.append(nameLabel);
            }

            $(tileOutline).append(nameChecks);

            $(tileOutline).hide();
            $(".tile-row").append(tileOutline);
            $(tileOutline).show(100);

            $("#total-number").text((Number($("#total-number").text()) + Number(foodPrice)).toFixed(2));
        }
    }

    alertPayout(context) {
        return function() {
            context.processItemData(context)();
            context.calculateTotals();
            let payoutString = "";

            for (const name of context.names) {
                payoutString = payoutString + name + ": " + context.personalTotals[name] + ", ";
            }

            alert(payoutString);
            alert("poopy");
        }
    }
}

let programState = new ProgramState();
let programUI = new ProgramUI(programState);

$("#name-button").on("click", programUI.submitNameList(programState));
$("#add-item").on("click", programUI.createFoodItemTile(programState));
$(".final-submit-button").on("click", programUI.alertPayout(programState));


