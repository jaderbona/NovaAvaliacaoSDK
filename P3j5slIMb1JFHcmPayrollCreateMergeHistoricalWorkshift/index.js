
/**
 * Nome da primitiva : createMergeHistoricalWorkshift
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn06325988
 **/

const axios = require('axios');

exports.handler = async event => {

    let body = parseBody(event);
    let tokenSeniorX = event.headers['X-Senior-Token'];

    const instance = axios.create({
        baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
        headers: {
          'Authorization': tokenSeniorX
        }
    });
   
       /* 
     ** Prova SDK
     ** CONSULTOR JADER BONA
     ** TRATAMENTO DAS OBRIGATORIEDADES DA GUIA CONTRATO 
     ** -- PARTE 02 -- Questão com escopo aberto.
     */

  //1.Validação do data de alteração do histórico salarial. 
  if (body.dateWhen < todayformatted()){
     return sendRes(400,'Só pode inserir histórico de escala com data maior ou igual a data atual!');
  };
  
  //2. Validação se a pessoa tem definiciência Física. Neste caso só poderá receber uma escala flexível (cod 3)
  let employee = await instance.get(`/hcm/payroll/entities/employee/${body.employee.id}`);
  if(employee.data.person.isdisabledperson == true){
      let escala = await instance.get(`/hcm/payroll/entities/workshift/${body.workshiftId.id}`);
      if (escala.data.code !== 3){
        return sendRes(400,'Só poderá inserir Escala Flexível (cod 3) para o colaborador!');
      }
  }
  
  /*Caso todas as validações passem*/
    return sendRes(200,body);
    
};
const parseBody = (event) => {
    return typeof event.body === 'string' ?  JSON.parse(event.body) : event.body || {};
};

const sendRes = (status, body) => {
    var response = {
      statusCode: status,
      headers: {
        "Content-Type": "application/json"
      },
      body: typeof body === 'string' ? body : JSON.stringify(body) 
    };
    return response;
};

function todayformatted(){
  let today = new Date();
  
  let dd = today.getDate() - 1;
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  
  if (dd < 10){
    dd = '0'+dd;
  }
  if (mm < 10){
    mm = '0' + mm;
  }
  return yyyy + '-' + mm + '-' + dd;
}