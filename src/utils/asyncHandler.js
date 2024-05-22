const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }



// const asyncHandler = ()=>{}this is a normal arrow function
// const asyncHandler = ()=>()=>{}this is a function which accepts the other function as the parameter
// const asyncHandler = ()=>async()=>{}this is a async function which accepts the other function as the parameter
// this is higher order functions these functions accept the other function as the parameter and pass it further

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)

//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.msg
//         })
//     }
// }
// this is also one method for the function wrapper