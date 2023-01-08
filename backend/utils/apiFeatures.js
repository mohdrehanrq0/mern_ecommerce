class apiFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i',
            }
        } : {};
        //console.log(keyword);

        this.query = this.query.find({ ...keyword });
        return this;
    }

    //filter function
    filter(){
        let queryCopy = {...this.queryStr};
        //console.log(queryCopy);
        let removeField = ['keyword', 'page','limit'];
        removeField.forEach((key) => delete queryCopy[key]);
        console.log(queryCopy);
        

        //applying filter for price
        let queryStr = JSON.stringify(queryCopy);
        console.log(queryStr);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);
        console.log(queryStr);


        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this
    }


}

module.exports = apiFeatures