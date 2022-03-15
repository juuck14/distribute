var dist = new Vue({
    el: "#dist",
    data: {
        fee:0.05,
        price: {},
        people: {},
        eqs: [],
        count: {},
        reCount: false,
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
        selectedExtraBoss: [],
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
        eqOnly: false,
        inform: ""
    },
    computed: {
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
                var idx = 1
                for(let i in this.bosses){
                    var exist = false
                    for(let j in groups){
                        if(JSON.stringify(groups[j].people.sort()) === JSON.stringify(this.bosses[i].sort())){
                            exist = true
                            groups[j].boss.push(i)
                        }
                    }
                    if(!exist){
                        groups['group' + idx] = {
                            boss: [i],
                            people: this.bosses[i]
                        }
                        idx++
                    }
                }
                return groups
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
        totalBossList: {
            cache: false,
            get() {
                var arr = []
                Object.values(this.groups).forEach(a=>{
                    arr = [...arr, ...a.boss]
                })
                return this.bossList.slice(2).filter(a=>[...new Set(arr)].includes(a))
            }
        },
        totalEach() {
            const total = {};
            for(let group in this.groups){
                //그룹별 수수료 제외 총합 계산
                var sum = 0
                if(!this.eqOnly){
                    for(let item in this.count[group]){
                        sum +=
                        this.count[group][item] *
                        (this.price[item] && this.price[item] !== ""
                            ? this.price[item]
                            : 0);
                    }
                    sum = sum * (1 - this.fee)
                }
                
                var thisEq = this.eqs.filter(a=>this.groups[group].boss.includes(a.boss))
                for(let eq of thisEq){
                    if(eq.price && eq.price != ""){
                        sum += eq.price * (1 - eq.fee)
                    }
                }

                //파티원별 비율 계산
                var rateObj = {}
                var that = this
                this.groups[group].people.forEach(a=>{
                    rateObj[a] = that.realPeople[a].filter(b=>b.boss === that.groups[group].boss[0])[0].rate
                })

                //그룹별 분배금 계산, 총 분배금에 더하기
                var totalByGroup = this.getRatedTotal(sum, rateObj, rateObj[this.chief])
                for(let people in totalByGroup){
                    if(total[people]) total[people] += totalByGroup[people]
                    else total[people] = totalByGroup[people]
                }
            }
            
            return total;
        }
    },
    watch: {
        groups: {
            handler(val, oldVal) {
                if(this.reCount){
                    this.count = {}
                    for(let i in val){
/*                         if((!oldVal[i] && val[i]) || JSON.stringify(val[i].boss.sort()) !== JSON.stringify(oldVal[i].boss.sort())){
                            this.count[i] = this.resetCount(val[i].boss)
                        } else if(oldVal[i] && !val[i]){
                            delete this.count[i]
                        } */
                        this.count[i] = this.resetCount(val[i].boss)
                    }
                } else{
                    this.reCount = true
                }
                localStorage["count"] = JSON.stringify(this.count);
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
            },
            deep: true,
        },
        count: {
            handler(val, oldVal) {
                localStorage["count"] = JSON.stringify(val);
            },
            deep: true,
        }
    },
    methods: {
        addBoss(val, type = 'addPeople', people = null) {
            if(type === 'addPeople'){
                var exist = false
                this.selectedBoss.forEach(a=>{
                    if(a.boss === val){
                        exist = true
                        return false
                    }
                })
                if(exist){
                    var myToast = Toastify({
                        text: "이미 선택된 보스입니다.",
                        duration: 3000
                    })
                    myToast.showToast();
                } else{
                    this.selectedBoss = [
                        ...this.selectedBoss,
                        {
                            boss: val,
                            rate: "rest",
                            useYn: true
                        }
                    ]
                }
            } else{
                var exist = false
                this.people[people].forEach(a=>{
                    if(a.boss === val){
                        exist = true
                        return false
                    }
                })
                this.selectedExtraBoss.forEach(a=>{
                    if(a.boss === val){
                        exist = true
                        return false
                    }
                })
                if(exist){
                    var myToast = Toastify({
                        text: "이미 선택된 보스입니다.",
                        duration: 3000
                    })
                    myToast.showToast();
                } else{
                    this.selectedExtraBoss = [
                        ...this.selectedExtraBoss,
                        {
                            boss: val,
                            rate: "rest",
                            useYn: true
                        }
                    ]
                }
            }
        },
        deleteBoss(index, type = 'addPeople', people = null){
            if(type === 'addPeople'){
                this.selectedBoss.splice(index, 1)
            } else if(type === 'extra'){
                this.selectedExtraBoss.splice(index, 1)
            } else{
                this.people[people].splice(index,1)
                var myToast = Toastify({
                    text: "삭제되었습니다.",
                    duration: 3000
                })
                myToast.showToast();
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
            document.getElementById("addBoss").value = ""
            location.reload();
            
        },
        deletePeople(name){
            var imsi = JSON.parse(JSON.stringify(this.people))
            delete imsi[name]
            this.people = imsi
            if(name === this.chief) this.chief = ""
            location.reload();
        },
        modalFocus(name){
            document.getElementById('nameEdit'+name).removeEventListener("shown.bs.modal", inputfocus)
            document.getElementById('nameEdit'+name).addEventListener("shown.bs.modal", inputfocus)
        },
        changeNickname(name){
            var newName = document.getElementById("nicknameEdit"+name).value
            var obj = {}
            if(!this.people[newName]){
                for(let i in this.people){
                    if(i !== name){
                        obj[i] = this.people[i]
                    } else{
                        obj[newName] = this.people[i]
                    }
                }
                this.people = obj
                if(name === this.chief) this.chief = newName
                var myToast = Toastify({
                    text: "닉네임이 변경되었습니다.",
                    duration: 3000
                })
                myToast.showToast();
            } else{
                var myToast = Toastify({
                    text: "이미 존재하는 캐릭터입니다.",
                    duration: 3000
                })
                myToast.showToast();
                return false;  
            }

        },
        changeChief(name, target){
            this.people[name] = this.people[name].map(a=>{
                return {
                    ...a,
                    useYn: true
                }
            })
            this.chief = name
            target.checked = true
        },
        addExtraBoss(name){
            this.people[name] = [...this.people[name], ...this.selectedExtraBoss]
            document.getElementById("addBossSelect"+name).value = ""
            var myToast = Toastify({
                text: "추가되었습니다.",
                duration: 3000
            })
            myToast.showToast();
        },
        reset(type, group="") {
            if(type === 'all'){
                localStorage.clear();
                location.reload();
            } else if(type === 'boss'){
                this.count = {
                    ...this.count,
                    [group]: this.resetCount(this.groups[group].boss)
                }
            }
        },
        resetCount(bosses){
            var cnt = {};
            for (let i of this.items) {
                if (i === "addcube") {
                    var add = 0
                    for(let boss of bosses){
                        if (["노멀 스우","노멀 데미안","노멀 가디언 엔젤 슬라임","이지 루시드"].includes(boss)) add +=  3;
                        else if (["이지 윌","노멀 루시드"].includes(boss)) add +=  4;
                        else if (["노멀 윌"].includes(boss)) add +=  5;
                        else if (["노멀 더스크","노멀 듄켈"].includes(boss)) add +=  6;
                        else if (["하드 데미안"].includes(boss)) add +=  7;
                        else if (["하드 스우"].includes(boss)) add +=  8;
                        else if (["하드 루시드","하드 윌","카오스 가디언 엔젤 슬라임","노멀 진 힐라"].includes(boss)) add +=  9;
                        else if (["카오스 더스크","하드 듄켈","하드 진 힐라","노멀 세렌"].includes(boss)) add +=  10;
                        else if (["하드 세렌"].includes(boss)) add +=  11;
                        else if (["검은 마법사"].includes(boss)) add +=  30;
                        else add +=  0;
                    }
                    cnt[i] = add
                } else cnt[i] = 0;
            }
            return cnt
        },
        filterItems(arr, bosses){
            var items = []
            for(let boss of bosses){
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
                items = [...items, ...newArr]
            }
            return [...new Set(items)]
        },
        numChange(type, group, item) {
            if (this.count) {
                this.count = {
                    ...this.count,
                    [group]: {
                        ...this.count[group],
                        [item]:
                            this.count[group][item] +
                                type >=
                                0
                                ? this.count[group][
                                    item
                                ] + type
                                : 0,
                    },
                };
            }
        },
        getUnit(n) {
            n = parseInt(n)
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
        getFormat(n) {
            n = n.toString();
            return (Math.round(n / this.round) * this.round)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        addeq() {
            this.eqs.push({
                boss: "",
                price: "",
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
        deleq(i) {
            this.eqs.splice(i, 1);
            var myToast = Toastify({
                text: "삭제되었습니다.",
                duration: 3000
            })
            myToast.showToast();
        },
        getRatedTotal(sum, rateObj, chief) {
            //sum: 수수료를 뗀 총합, rateObj: 비율 오브젝트, chief: 파티장의 비율
            var total = {}
            var rateArr = Object.values(rateObj)
            var rateSum = rateArr.reduce((total, value)=>{
                return total + (value != "rest" && value != "" ? parseFloat(value) : 0)
            }, 0)
            var rest = (100 - rateSum) / rateArr.filter(a=>a === "rest").length
            chief = chief === 'rest'?rest:chief

            //전체에서 파티원의 비율
            var memR = (100 - chief)/(100 - (0.05 * chief));

            for(let i in rateObj){
                var target = 0
                if(rateObj[i] === 'rest') target = rest
                else target = rateObj[i]
                total[i] = sum * memR * (target / (100 - chief))//파티원에서 target의 비율
            }
            return total;
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
        } else{
            this.reCount = true
        }
        if (localStorage.getItem("eqs")) {
            this.eqs = JSON.parse(localStorage.getItem("eqs"));
        }
        if (localStorage.getItem("round")) {
            this.round = JSON.parse(localStorage.getItem("round"));
        }
        if (localStorage.getItem("count")) {
            this.reCount = false
            this.count = JSON.parse(localStorage.getItem("count"));
        }
    },
});
function inputfocus(){
    this.children[0].children[0].children[0].children[1].children[1].focus()
}