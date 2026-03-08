import axios, { AxiosRequestConfig, Method } from 'axios';

interface RequestOptions {
  url: string;
  method: string;
  headers?: any;
  bodyParams?: any;
  replacements: Record<string, string>;
}

export const makeApiRequest = async ({ url, method, headers = {}, bodyParams = {}, replacements }: RequestOptions) => {
  // Substituir tokens na URL
  let finalUrl = url;
  Object.keys(replacements).forEach(key => {
    finalUrl = finalUrl.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
  });

  // Substituir tokens nos Headers
  const finalHeaders = { ...headers };
  Object.keys(finalHeaders).forEach(headerKey => {
    if (typeof finalHeaders[headerKey] === 'string') {
      Object.keys(replacements).forEach(key => {
        finalHeaders[headerKey] = finalHeaders[headerKey].replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
      });
    }
  });

  // Substituir tokens no Body
  let finalBody = bodyParams ? JSON.parse(JSON.stringify(bodyParams)) : {}; 
  if (Object.keys(finalBody).length > 0) {
    const replaceInObject = (obj: any) => {
      for (const k in obj) {
        if (typeof obj[k] === 'string') {
          Object.keys(replacements).forEach(key => {
            obj[k] = obj[k].replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
          });
        } else if (typeof obj[k] === 'object' && obj[k] !== null) {
          replaceInObject(obj[k]);
        }
      }
    };
    replaceInObject(finalBody);
  }

  // Configuração do Axios
  const config: AxiosRequestConfig = {
    method: method as Method,
    url: finalUrl,
    headers: finalHeaders,
    data: method === 'POST' || method === 'PUT' ? finalBody : undefined,
    timeout: 30000, // 30 segundos de timeout
    validateStatus: () => true // Não jogar erro em status != 200 para tratarmos manualmente
  };

  // Debug: Logar requisição de saída
  console.log(`[API Proxy] Requesting: ${finalUrl}`);
  console.log(`[API Proxy] Method: ${method}`);
  console.log(`[API Proxy] Headers:`, finalHeaders);
  if (finalBody && Object.keys(finalBody).length > 0) console.log(`[API Proxy] Body:`, JSON.stringify(finalBody));

  try {
    const response = await axios(config);
    console.log(`[API Proxy] Response Status: ${response.status}`);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error: any) {
    console.error('Erro na requisição externa:', error.message);
    throw new Error(`Falha na API externa: ${error.message}`);
  }
};
