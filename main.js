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
            "rein",
            "forrein",
            "darkrein",
            "flame",
            "forflame",
            "darkflame",
            "pos",
            "scroll",
            "pscroll",
            "ppet",
            "magic",
            "ess"
        ],
        nickname:"",
        selectedBoss: [],
        boss: {},
        chief: "",
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
            "노멀 진 힐라",
            "카오스 가디언 엔젤 슬라임",
            "카오스 더스크",
            "하드 듄켈",
            "하드 진 힐라",
            "노멀 세렌",
            "하드 세렌",
            // "카오스 칼로스",
            "검은 마법사"
        ],
        eqIncludes: 'Y',
        rates:{}
    },
    computed: {
        me() {
            return this.eqs[0] && this.eqs[0].tag === '장비1미'?true:false
        },
        realPeople: {
            cache: false,
            get() {
                var real = {}
                for(let i in this.people){
                    real[i] = this.people[i].filter(a=>a.useYn)
                }
                return real
            }
        },
        bosses: {
            cache: false,
            get() {
                var boss = {}
                for(let i in this.realPeople){
                    this.realPeople[i].forEach(a=>{
                        if(boss[a.boss]) boss[a.boss].push(i)
                        else boss[a.boss] = [i]
                    })
                }
                return boss
            }
        },
        groups: {
            cache: false,
            get() {
                var groups = {}
                for(let i in this.bosses){
                    var exist = false
                    var idx = 1
                    for(let j in groups){
                        if(JSON.stringify(groups[j].people.sort()) === JSON.stringify(this.bosses[i].sort())){
                            exist = true
                            groups.boss.push(i)
                            break
                        }
                    }
                    if(!exist){
                        group['group' + idx] = {
                            boss: [i],
                            people: this.bosses[i]
                        }
                    }
                }
                return boss
            }
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
                        bunbae *= this.getDiv(this.people[i]);
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
        ratedTotal() {
            var tot = {}
            for(let i in this.rates){
                if(this.rates[i].useYn){
                    var sum = 0;
                    if(this.totalEach[i]){
                        sum = this.totalEach[i].sum
                        var total = []
                        total[0] = this.rates[i].rate[0] != ""?this.getRatedTotal(sum, this.rates[i].rate[0]):0
                        if(this.rates[i].rate[0] == "" && this.rates[i].rate[1] != ""){
                            total[1] = 0
                        } else{
                            total[1] = this.rates[i].rate[1] != ""?this.getRatedTotal(sum, this.rates[i].rate[0], this.rates[i].rate[1]):0
                        }
                        tot[i] = total
                    }
                }
            }
            return tot
        },
        realTotal() {
            var sum = 0;
            var that = this;
            this.selected.forEach((a) => {
                if(a.split('_')[1]){
                    if(that.ratedTotal[a.split('_')[0]]){
                        sum += that.ratedTotal[a.split('_')[0]][a.split('_')[1]];
                    }
                } else sum += that.totalEach[a].total;
                
            });
            return sum;
        },
    },
    watch: {
        boss: {
            handler(val, oldVal) {
/*                 let del = Object.keys(this.people).filter(a => !val.includes(a))
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
                for(let i in this.rates){
                    if(!Object.keys(this.totalEach).includes(i)){
                        delete this.rates[i]
                    }
                } */
                localStorage["boss"] = JSON.stringify(val);
            },
            deep: true
        },
        fee(val, oldVal) {
            localStorage["fee"] = val;
        }, 
        round(val, oldVal) {
            localStorage["round"] = val;
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
        chief(val, oldVal) {
            localStorage["chief"] = val;
        },
        eqs: {
            handler(val, oldVal) {
                localStorage["eqs"] = JSON.stringify(val);
                for(let i in this.rates){
                    if(!Object.keys(this.totalEach).includes(i)){
                        delete this.rates[i]
                    }
                }
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
                    val[i].rate[0] = val[i].rate[0] > 100? 100:val[i].rate[0]
                    val[i].rate[1] = val[i].rate[1] > 100? 100:val[i].rate[1]
                }
            },
            deep: true,
        },
        totalEach: {
            handler(val, oldVal) {
                for(let i of this.selected){
                    if(!Object.keys(val).includes(i)){
                        this.selected = this.selected.filter(a => a != i);
                    }
                }
            },
            deep: true,
        }
    },
    methods: {
        addBoss(val) {
            this.selectedBoss = [
                ...this.selectedBoss,
                {
                    boss: val,
                    rate: "rest",
                    useYn: true
                }
            ]
        },
        deleteBoss(index, type = 'addPeople', people = null){
            if(type === 'addPeople'){
                this.selectedBoss.splice(index, 1)
            } else{
                this.people[people].splice(index,1)
            }
        },
        addPeople() {
            if(this.nickname.length == 0){
                var myToast = Toastify({
                    text: "닉네임을 입력해주세요.",
                    duration: 3000
                })
                myToast.showToast();
                return false;         
            }
            if(this.people[this.nickname]){
                var myToast = Toastify({
                    text: "이미 존재하는 캐릭터입니다.",
                    duration: 3000
                })
                myToast.showToast();
                return false;         
            }
            if(document.getElementById("chief").checked && this.chief.length > 0){
                var myToast = Toastify({
                    text: "파티장이 이미 존재합니다.",
                    duration: 3000
                })
                myToast.showToast();
                return false;
            }
            if(this.selectedBoss.length == 0){
                var myToast = Toastify({
                    text: "보스를 선택해주세요.",
                    duration: 3000
                })
                myToast.showToast();
                return false;
            }
            let r = true
            this.selectedBoss.forEach(a=>{
                if(a.rate != 'rest' && a.rate >= 100){
                    var myToast = Toastify({
                        text: "비율은 100 미만이어야 합니다.",
                        duration: 3000
                    })
                    myToast.showToast();
                    r = false
                }
            })
            if(!r){
                return false
            }
            this.people = {
                ...this.people,
                [this.nickname]: this.selectedBoss
            }
            this.chief = document.getElementById("chief").checked?this.nickname:this.chief
            this.nickname = ""
            this.selectedBoss = []
            document.getElementById("chief").checked = false
        },
        changeNickname(name){
            var newName = document.getElementById("nicknameEdit"+name).value
            var obj = {}
            for(let i in this.people){
                if(i !== name){
                    obj[i] = this.people[i]
                } else{
                    obj[newName] = this.people[i]
                }
            }
            this.people = obj

        },
        changeChief(name){
            this.people[name] = this.people[name].map(a=>{
                return {
                    ...a,
                    useYn: true
                }
            })
            this.chief = name
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
                    else if (["하드 루시드","하드 윌","카오스 가디언 엔젤 슬라임","노멀 진 힐라"].includes(boss)) cnt[i] = 9;
                    else if (["카오스 더스크","하드 듄켈","하드 진 힐라","노멀 세렌"].includes(boss)) cnt[i] = 10;
                    else if (["하드 세렌"].includes(boss)) cnt[i] = 11;
                    else if (["검은 마법사"].includes(boss)) cnt[i] = 30;
                    else cnt[i] = 0;
                } else cnt[i] = 0;
            }
            return cnt
        },
        filterItems(arr, boss){
            var last = 0
            var remove = 0
            if (["노멀 스우","노멀 데미안"].includes(boss)) last = 7;
            else if (["노멀 가디언 엔젤 슬라임","이지 루시드", "이지 윌","노멀 루시드","노멀 윌"].includes(boss)) last = 8;
            else if (["노멀 더스크","노멀 듄켈"].includes(boss)) last = 9;
            else if (["하드 스우","하드 데미안","하드 루시드","하드 윌","노멀 진 힐라"].includes(boss)) last = 14;
            else if (["카오스 가디언 엔젤 슬라임","카오스 더스크","하드 듄켈","하드 진 힐라","노멀 세렌","하드 세렌","검은 마법사"].includes(boss)) {
                last = 18;
                remove = 13;
            }
            var newArr = arr.slice(0, last)
            
            newArr = remove > 0?newArr.filter(a => a != 'scroll'):newArr
            return newArr
        },
        numChange(type, boss, item) {
            if (this.count) {
                this.count = {
                    ...this.count,
                    [boss]: {
                        ...this.count[boss],
                        [item]:
                            this.count[boss][item] +
                                type >=
                                0
                                ? this.count[boss][
                                    item
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
            var units = [" 만", " 억", " 조"];
            for (let i = 0; i < r.length / 4; i++) {
                part.push(r.substr(i * 4, 4));
            }
            var u = "";
            for (let i = 0; i < part.length; i++) {
                u += part[i] + (i != part.length - 1 ? units[i] : "");
            }
            return this.getReverse(u) + '메소';
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
                this.people = {
                    ...this.people,
                    [i]: this.people[i] + type >= 1
                            ? this.people[i] + type
                            : 1
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
            this.eqs[i].num = this.people[val]?this.people[val]:this.eqs[i].num
        },
        deleq(i) {
            this.eqs.splice(i, 1);
        },
        changeEqIncludes() {
            this.selected = []
            this.rates = {}
        },
        toggle(k, i = "") {
            if (this.selected.includes(k + i)) {
                this.selected = this.selected.filter((a) => a.indexOf(k) < 0);
            } else {
                this.selected = this.selected.filter((a) => a.indexOf(k) < 0);
                this.selected.push(k + i);
            }
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
        getRatedTotal(sum, head, target = head) {
            var memR = (100 - head)/(100 - (0.05 * head));
            var targetR = target / (100 - head);
            console.log(sum, head, target, memR, targetR)
            return sum * memR * targetR;
        }
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
        if (localStorage.getItem("chief")) {
            this.chief = localStorage.getItem("chief");
        }
        if (localStorage.getItem("people")) {
            this.people = JSON.parse(localStorage.getItem("people"));
        }
        if (localStorage.getItem("eqs")) {
            this.eqs = JSON.parse(localStorage.getItem("eqs"));
        }
        if (localStorage.getItem("round")) {
            this.round = JSON.parse(localStorage.getItem("round"));
        }
        if (localStorage.getItem("count")) {
            this.count = JSON.parse(localStorage.getItem("count"));
        } /* else {
            for (let i of this.boss) {
                this.count[i] = this.resetCount(i);
            }
        } */
    },
});
