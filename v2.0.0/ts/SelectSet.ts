class SelectSet {
    setArray:any[];
    currentNo:number;
    prev:number;
    constructor(setArray = [], currentNo = -1, prev = -1){
        this.setArray = setArray;this.currentNo = currentNo;this.prev = prev;
    }
    get current(){return this.currentNo;}
    set current(value:number) {
        // console.log("current being set ", value, "previous", this.prev);
        if (this.currentNo != value) {
            // console.log("Changed");
            if (this.prev >= 0 && argsClass.TypeOf( this.setArray[this.prev] ) == "El_Feature")
                (<El_Feature>this.setArray[this.prev]).selected = false;
            this.currentNo = value;
            this.prev = this.currentNo;
            if (this.currentNo >= 0 && this.currentNo < this.setArray.length && argsClass.TypeOf( this.setArray[this.currentNo] ) == "El_Feature"){
                (<El_Feature>this.setArray[this.currentNo]).selected = true;
            }
            this.currentNo = value;
        } // else console.log("No Change");
    }
}