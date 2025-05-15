const points = (state = [],action) =>{
    switch (action.type) {
        case 'GET_POINTS':
            console.log("getpoints reducer works")

            return action.data;
            break;
        default:
            return state;

    }
}


export default points