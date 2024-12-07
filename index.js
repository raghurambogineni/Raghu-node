const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Port number that server listens to
const PORT = 1739;

const bookDetails = async (client) => {
    //Fetches records from given database
    const cursor = await client.db("ComicBooksDB").collection("ComicBooks").find({});
    const results = await cursor.toArray();
    return JSON.stringify(results);
}

//Creates HTTP Server(i.e our system acts as server)
http.createServer(async (req, res) => {
    if (req.url === "/api") {
        const URL = "mongodb+srv://raghurambogineni:raghubogineni@comicbookcluster.eruxg.mongodb.net/?retryWrites=true&w=majority&appName=ComicBookCluster";

        // Creating a new client for connecting to database
        const client = new MongoClient(URL);
        try {
            // Connects to database
            await client.connect();
            console.log("Database is connected sucessfully");
            const bookData = await bookDetails(client);
            // Handling CORS Issue
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.writeHead(200, { "content-type": "application/json" });
            res.end(bookData);
        }
        catch (err) {
            console.error("Error in connecting database", err);
        }
        finally {
            //Closing connection to database
            await client.close();
            console.log("Database connection is closed");
        }
    }
    else{
        let mediaType;
        let fileLocation = path.join(__dirname,"public", req.url==="/" ? "index.html": req.url);
        let fileFormat =  path.extname(fileLocation);
        switch(fileFormat){
            case ".html":
                mediaType = "text/html";
                break;
            case ".css":
                mediaType = "text/css";
                break;
            case ".js":
                mediaType = "application/js";
                break;
            case ".json":
                mediaType = "application/json";
                break;
            default:
                mediaType = "text/plain";
                break;
        }
        fs.readFile(fileLocation,(err,data)=>{
            if(err){
                if(err.code === "ENOENT"){
                    res.writeHead(404,{"content-type":"text/html"});
                    res.end("<h1> 404 Page Not Found!</h1>");
                }
                else{
                    res.writeHead(500, { "content-type": "text/plain" });
                    res.end("Internal Server Error");
                }
            }
            else{
                //Assigning content-type based on file type extension
                res.writeHead(200,{"content-type":mediaType});
                res.end(data);
            }
        })
    }
}).listen(PORT, () => console.log(`Server is running on ${PORT}`));