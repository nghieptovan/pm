const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const asyncValidate = (values) => {
  return sleep(1000).then(() => {
    throw { email: values.email }    
  })
}

export default asyncValidate;



// import { hostname, s3URL} from '../config';


// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// const asyncValidate = (values /*, dispatch */) => {
//   return sleep(1000).then(() => {
//     let dataReturn;
//     let url = `${hostname}/api/widget/account?email=${values.email}`;
    
//     throw { email: dataReturn }
//   })
// }

// export default asyncValidate;