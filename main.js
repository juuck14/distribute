
var dist = new Vue({
    el: "#dist",
    data: {
        fee:5,
        price: {},
        selected: [],
        people: {},
        eqs: [],
        count: {},
        round: 10000,
        items: [
            "extra",
            "small",
            "red",
            "blue",
            "addcube",
            "honor",
            "flame",
            "forflame",
            "darkflame",
            "rein",
            "forrein",
            "darkrein",
            "pos",
            "scroll",
            "pscroll",
            "ess"
        ],
        boss: [
        ],
        bossList: [
            "노멀 스우",
            "노멀 데미안",
            "노멀 가디언 엔젤 슬라임",
            "이지 루시드",
            "이지 윌",
            "노멀 루시드",
            "노멀 윌",
            "노멀 더스크",
            "노멀 듄켈",
            "하드 데미안",
            "하드 스우",
            "하드 루시드",
            "하드 윌",
            "카오스 가디언 엔젤 슬라임",
            "노멀 진 힐라",
            "카오스 더스크",
            "하드 듄켈",
            "하드 진 힐라",
            "노멀 세렌",
            "하드 세렌",
            "카오스 칼로스",
            "검은 마법사"
        ],
        eqIncludes: 'Y',
        rates:{}
    },
    computed: {
        me() {
            return this.eqs[0] && this.eqs[0].tag === '장비1미'?true:false
        },
        existYn() {
            const exist = {};
            if (Object.keys(this.count).length > 0) {
                for (let i in this.count) {
                    for (let j in this.count[i]) {
                        if (this.count[i][j] > 0 && !exist[j])
                            exist[j] = true;
                    }
                }
            }
            return exist;
        },
        total() {
            const tot = {};
            if (Object.keys(this.count).length > 0) {
                for (let i in this.count) {
                    var bunbae = 0;
                    for (let j in this.count[i]) {
                        bunbae +=
                            this.count[i][j] *
                            (this.price[j] || this.price[j] == ""
                                ? this.price[j]
                                : 0);
                    }
                    bunbae *= this.getDiv(this.people[i].num);
                    for (let j of this.eqs) {
                        if (
                            j.boss === i &&
                            j.price != "" &&
                            j.num != ""
                        ) {
                            bunbae += j.price * this.getDiv(j.num);
                        }
                    }
                    tot[i] = bunbae;
                }
            }
            return tot;
        },
        totalEach: {
            cache: false,
            get() {
                const tot = {};
                if (Object.keys(this.count).length > 0) {
                    for (let i in this.count) {
                        var bunbae = 0;
                        for (let j in this.count[i]) {
                            bunbae +=
                                this.count[i][j] *
                                (this.price[j] || this.price[j] == ""
                                    ? this.price[j]
                                    : 0);
                        }
                        var sum = bunbae * ((100 - this.fee)/100)
                        bunbae *= this.getDiv(this.people[i].num);
                        tot[i] = {
                            name: i,
                            total: bunbae,
                            sum: sum
                        };
                    }
                }
                for (let i of this.eqs) {
                    var bunbae = 0;
                    var sum = 0
                    if (i.price && i.num && i.price != "" && i.num != "") {
                        sum += i.price * ((100 - i.fee)/100)
                        bunbae += i.price * this.getDiv(i.num, i.fee);
                    }
                    if(i.boss && i.price && i.num && i.boss != "" && i.price != "" && i.num != ""){
                        if(this.eqIncludes === 'Y'){
                            tot[i.boss] = {
                                name: i.boss,
                                total: bunbae + (tot[i.boss]?tot[i.boss].total:0),
                                sum: sum + (tot[i.boss]?tot[i.boss].sum:0)
                            };
                        } else{
                            tot['eq' + i.index] = {
                                name: i.tag,
                                total: bunbae,
                                boss: i.boss,
                                sum: sum
                            };
                        }
                    }
                }
                return tot;
            }
        },
        realTotal() {
            var sum = 0;
            var that = this;
            this.selected.forEach((a) => {
                sum += that.totalEach[a].total;
            });
            return sum;
        },
    },
    watch: {
        boss: {
            handler(val, oldVal) {
                let del = Object.keys(this.people).filter(a => !val.includes(a))
                if (del.length > 0) {
                    delete this.people[del[0]]
                }
                let add = val.filter(a => !Object.keys(this.people).includes(a))
                if (add.length > 0) {
                    this.people = {
                        ...this.people,
                        [add[0]]: {
                            num: 6,
                            rate: ["","","","","",""],
                            rateYn: 'N'
                        }
                    }
                }
                localStorage["boss"] = JSON.stringify(val);
            },
            deep: true
        },
        fee(val, oldVal) {
            localStorage["fee"] = val;
        }, 
        price: {
            handler(val, oldVal) {
                localStorage["price"] = JSON.stringify(val);
            },
            deep: true,
        },
        people: {
            handler(val, oldVal) {
                localStorage["people"] = JSON.stringify(val);
            },
            deep: true,
        },
        eqs: {
            handler(val, oldVal) {
                localStorage["eqs"] = JSON.stringify(val);
            },
            deep: true,
        },
        count: {
            handler(val, oldVal) {
                localStorage["count"] = JSON.stringify(val);
            },
            deep: true,
        },
        rates: {
            handler(val, oldVal) {
                for(let i in val){
                    if(val[i].useYn){
                        var sum = 0;
                        if(this.totalEach[i]){
                            sum = this.totalEach[i].sum
                            var total = []
                            total[0] = val[i].rate[0] != ""?1:0
                            if(val[i].rate[0] == "" && val[i].rate[1] != ""){
                                alert("파티장의 비율을 먼저 입력해야 합니다.")
                                this.rates[i].rate[1] = ""
                                total[1] = 0
                            } else{
                                total[1] = val[i].rate[1] != ""?1:0
                            }
                            this.rates = {
                                ...val,
                                [i]: {
                                    ...val[i],
                                    total: total
                                }
                            }
                            
                        }
                    }
                }
            },
            deep: true,
        },
    },
    methods: {
        addboss(val) {
            if (this.boss.includes(val)) {

            } else {
                this.count = {
                    ...this.count,
                    [val]: this.resetCount(val)
                }
                this.boss.push(val)

            }
        },
        reset(type, boss="") {
            if(type === 'all'){
                localStorage.clear();
                location.reload();
            } else if(type === 'boss'){
                this.count = {
                    ...this.count,
                    [boss]: this.resetCount(boss)
                }
            }
        },
        resetCount(boss){
            var cnt = {};
            for (let i of this.items) {
                if (i === "addcube") {
                    if (["노멀 스우","노멀 데미안","노멀 가디언 엔젤 슬라임","이지 루시드"].includes(boss)) cnt[i] = 3;
                    else if (["이지 윌","노멀 루시드"].includes(boss)) cnt[i] = 4;
                    else if (["노멀 윌"].includes(boss)) cnt[i] = 5;
                    else if (["노멀 더스크","노멀 듄켈"].includes(boss)) cnt[i] = 6;
                    else if (["하드 데미안"].includes(boss)) cnt[i] = 7;
                    else if (["하드 스우"].includes(boss)) cnt[i] = 8;
                    else if (["하드 스우","하드 루시드","하드 윌","카오스 가디언 엔젤 슬라임","노멀 진 힐라"].includes(boss)) cnt[i] = 9;
                    else if (["카오스 더스크","하드 듄켈","하드 진 힐라","노멀 세렌"].includes(boss)) cnt[i] = 10;
                    else if (["하드 세렌"].includes(boss)) cnt[i] = 11;
                    else if (["검은 마법사"].includes(boss)) cnt[i] = 30;
                    else cnt[i] = 0;
                } else cnt[i] = 0;
            }
            return cnt
        },
        deleteBoss(boss){
            this.boss = this.boss.filter(a=>a!=boss)
            delete this.count[boss]
        },
        numChange(type, i, j, k) {
            if (this.count) {
                this.count = {
                    ...this.count,
                    [i]: {
                        ...this.count[i],
                        [this.items[j * 4 + k - 5]]:
                            this.count[i][this.items[j * 4 + k - 5]] +
                                type >=
                                0
                                ? this.count[i][
                                this.items[j * 4 + k - 5]
                                ] + type
                                : 0,
                    },
                };
            }
        },
        getUnit(n) {
            n = n.toString();
            var r = this.getReverse(n);
            var part = [];
            var units = ["만", "억", "조"];
            for (let i = 0; i < r.length / 4; i++) {
                part.push(r.substr(i * 4, 4));
            }
            var u = "";
            for (let i = 0; i < part.length; i++) {
                u += part[i] + (i != part.length - 1 ? units[i] : "");
            }
            return this.getReverse(u);
        },
        getReverse(n) {
            var r = "";
            for (let i = 1; i <= n.length; i++) {
                r += n[n.length - i];
            }
            return r;
        },
        getTotal(arr) {
            var total = 0;
            for (let i of arr) {
                total += this.total[i]?this.total[i]:0;
            }
            return this.getFormat(total);
        },
        getFormat(n) {
            n = n.toString();
            return (Math.round(n / this.round) * this.round)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        getDiv(n, fee=this.fee) {
            return (100-fee) / (100 * n - 5);
        },
        peopleChange(type, i) {
            if (this.people) {
                let newArr = [...this.people[i].rate]
                if(type == 1) newArr.push("")
                else if(type == -1 && newArr.length > 1) newArr.pop()

                this.people = {
                    ...this.people,
                    [i]: {
                        ...this.people[i],
                        num: this.people[i].num + type >= 1
                            ? this.people[i].num + type
                            : 1,
                        rate: newArr
                    }
                        
                };
            }
        },
        addeq() {
            this.eqs.push({
                boss: "",
                price: "",
                num: "",
                tag:
                    "장비" +
                    (this.eqs.reduce(
                        (total, value) =>
                            total > value.index ? total : value.index,
                        0
                    ) +
                        1),
                index:
                    this.eqs.reduce(
                        (total, value) =>
                            total > value.index ? total : value.index,
                        0
                    ) + 1,
                fee: this.fee
            });
        },
        changeEqBoss(val, i){
            this.eqs[i].num = this.people[val]?this.people[val].num:this.eqs[i].num
        },
        deleq(i) {
            this.eqs.splice(i, 1);
        },
        changeEqIncludes() {
            this.selected = []
        },
        toggle(k) {
            if (this.selected.includes(k)) {
                this.selected = this.selected.filter((a) => a != k);
            } else this.selected.push(k);
        },
        changeRateYn(key, type) {
            if (type) {
                if(this.rates[key]){
                    this.rates = {
                        ...this.rates,
                        [key]: {
                            ...this.rates[key],
                            useYn: true
                        }
                    }
                } else{
                    this.rates = {
                        ...this.rates,
                        [key]: {
                            useYn: true,
                            rate: ["", ""],
                            total: ""
                        }
                    }
                }
            } else {
                this.rates = {
                    ...this.rates,
                    [key]: {
                        ...this.rates[key],
                        useYn: false
                    }
                }
            }
        },
    },
    created() {
        if (localStorage.getItem("boss")) {
            this.boss = JSON.parse(localStorage.getItem("boss"));
        }
        if (localStorage.getItem("fee")) {
            this.fee = localStorage.getItem("fee")
        }
        if (localStorage.getItem("price")) {
            this.price = JSON.parse(localStorage.getItem("price"));
        }
        if (localStorage.getItem("people")) {
            this.people = JSON.parse(localStorage.getItem("people"));
        }
        if (localStorage.getItem("eqs")) {
            this.eqs = JSON.parse(localStorage.getItem("eqs"));
        }
        if (localStorage.getItem("count")) {
            this.count = JSON.parse(localStorage.getItem("count"));
        } else {
            for (let i of this.boss) {
                this.count[i] = this.resetCount(i);
            }
        }
    },
});