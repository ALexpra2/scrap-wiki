/* Paso 4: Accederemos a la web de wikipedia (https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap), en esa web encontraremos enlaces a los que tendremos que acceder 
y recorrer esas página y recoger los siguinetes datos:
    El título (h1)
    Todas las imágenes ('img')
    Todos los textos ('p')

Paso 5: Crea un array y dentro guarda cada uno de los datos de las páginas en un objeto (título, imagenes, textos)

Paso 6: Saca toda esa información en un console.log() cuando todo termine, o en un res.send() en la misma ruta o en otra... donde decidas


Para recoger los enlaces, deberás recoger solo los que están dentro del ID: #mw-pages. Será algo así: $('#mw-pages a').each((index, element)...
Para poder entrar en cada URL interior primero tendrás que traer todas las URLs donde quieres entrar y a partir de ahí recorrerlas con otro bucle para poder pasar los datos.
 */


const cheerio = require('cheerio');
const axios = require('axios');
const express = require('express');
const app = express();

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/', (req, res) => {
    axios.get(url).then((response) => {
        if (response.status === 200) {
            const html = response.data;  //traigo todos los datos de la url                               
            const $ = cheerio.load(html);   //Traigo a la variable $ la informacion de la pagina con cheerio cargando la informacion de html                            

            const urls = [];
            const infContainer = []; 
            
            //cargo en urls todas las que estan dentro de ID: #mw-pages
            $('#mw-pages a').each((index, element) => {                
                const ruta = $(element).attr('href');
                urls.push(ruta);
            });

            // Uso Promise.all() para esperar que carguen todos los datos antes de responder con json
            Promise.all(
                //recorro urls añadiendo la base específica de wikiloc
                urls.map((url) => { 
                   return axios.get(`https://es.wikipedia.org${url}`).then((response) => {
                        if (response.status === 200) {
                            const html = response.data;
                            const $ = cheerio.load(html);

                            const titulo = $('h1').text();
                            
                            const imgs = []; 
                            const textos = [];  

                            $('img').each((index, element) => {
                                const img = $(element).attr('src');
                                imgs.push(img);
                            });

                            $('p').each((index, p) => {
                                textos.push($(p).text());
                            });

                            infContainer.push({
                                titulo,
                                imgs,
                                textos,
                            });
                        }
                    })
                })
            ).then(() => {
                res.json(infContainer); // Envio la respuesta solo después de que terminen todas las peticiones
            });
        }
    })
});

app.listen(3000, () => {
    console.log('Express está escuchando en el puerto http://localhost:3000');
});
