
var dist = new Vue({
    el: "#dist",
    data: {
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
            "ess",
        ],
        boss: [
        ],
        bossList: [
            "노멀 데미안",
            "노멀 스우",
            "노멀 가디언 엔젤 슬라임",
            "이지 루시드",
            "이지 윌",
            "노멀 루시드",
            "노멀 윌",
            "노멀 거대 괴수 더스크",
            "노멀 친위대장 듄켈",
            "하드 스우",
            "하드 데미안",
            "카오스 가디언 엔젤 슬라임",
            "하드 루시드",
            "하드 윌",
            "카오스 거대 괴수 더스크",
            "노멀 진 힐라",
            "하드 친위대장 듄켈",
            "하드 진 힐라",
            "노멀 선택받은 세렌",
            "하드 선택받은 세렌",
            "카오스 감시자 칼로스",
            " 검은 마법사"
        ]
    },
    computed: {
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
                    bunbae *= this.getDiv(this.people[i]);
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
        totalEach() {
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
                    bunbae *= this.getDiv(this.people[i]);
                    tot[i] = {
                        name: i,
                        total: bunbae,
                    };
                }
                var n = {};
                for (let i of this.boss) {
                    n[i] = 1;
                }
                for (let i of this.eqs) {
                    var bunbae = 0;
                    if (i.price != "" && i.num != "") {
                        bunbae += i.price * this.getDiv(i.num);
                    }
                    tot['eq' + i.index] = {
                        name: i.tag,
                        total: bunbae,
                    };
                    n[i.boss] += 1;
                }
            }
            return tot;
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
        boss(val, oldVal) {
            let del = Object.keys(this.people).filter(a => !val.includes(a))
            if (del.length > 0) {
                delete this.people[del[0]]
            }
            let add = val.filter(a => !Object.keys(this.people).includes(a))
            if (add.length > 0) {
                this.people = {
                    ...this.people,
                    [add[0]]: 6
                }
            }
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
    },
    methods: {
        addboss(val) {
            if (this.boss.includes(val)) {

            } else {
                var cnt = {};
                for (let j of this.items) {
                    if (j === "addcube") {
                        if (val === "루시드") cnt[j] = 9;
                        else if (val === "윌") cnt[j] = 9;
                        else if (val === "스데듄") cnt[j] = 36;
                        else if (val === "더슬") cnt[j] = 19;
                        else cnt[j] = 0
                    } else cnt[j] = 0;
                }
                this.count[val] = cnt;
                this.boss.push(val)

            }
        },
        reset() {
            localStorage.clear();
            location.reload();
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
            localStorage["count"] = JSON.stringify(this.count);
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
                total += this.total[i];
            }
            return this.getFormat(total);
        },
        getFormat(n) {
            n = n.toString();
            return (Math.round(n / this.round) * this.round)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        getDiv(n) {
            return 95 / (100 * n - 5);
        },
        peopleChange(type, i) {
            if (this.people) {
                this.people = {
                    ...this.people,
                    [i]:
                        this.people[i] + type >= 0
                            ? this.people[i] + type
                            : 0,
                };
            }
        },
        addeq() {
            this.eqs.push({
                boss: this.boss[0],
                price: "",
                num: this.people[this.boss[0]],
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
            });
        },
        deleq(i) {
            this.eqs.splice(i, 1);
        },
        toggle(k) {
            if (this.selected.includes(k)) {
                this.selected = this.selected.filter((a) => a != k);
            } else this.selected.push(k);
        },
    },
    created() {
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
                var cnt = {};
                for (let j of this.items) {
                    if (j === "addcube") {
                        if (i === "루시드") cnt[j] = 9;
                        else if (i === "윌") cnt[j] = 9;
                        else if (i === "스데듄") cnt[j] = 36;
                        else if (i === "더슬") cnt[j] = 19;
                    } else cnt[j] = 0;
                }
                this.count[i] = cnt;
            }
        }
    },
});