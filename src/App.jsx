import { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import Modal from "./component/modal.jsx";
import loadingSVG from "./assets/loading.svg";
import uploadSVG from "./assets/upload-main.svg"

function App() {
  const [checkbox, setCheckbox] = useState(false);
  const [savedata, setSavedata] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [imageB64, setImageB64] = useState("");
  const [smashes, setSmashes] = useState("");
  const [passes, setPasses] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const storedSmashes = localStorage.getItem("smashes")
    const storedPasses = localStorage.getItem("passes")


    setSmashes(Number(storedSmashes) || 0)
    setPasses(Number(storedPasses) || 0)

    setSavedata((localStorage.getItem("saveData") === "true") ? true : false) //note: v react dev thingy (npm run dev) to bude po refreshi vždycky false cause funny
    get_image()
  }, []) //[] = run only once on component load nebo tak něco

  useEffect(() => {
    localStorage.setItem("smashes", smashes)
    localStorage.setItem("passes", passes)
  }, [smashes, passes]) //run on smashes||passes change

  useEffect(() =>{
    localStorage.setItem("saveData", savedata)
  }, [savedata]) //aby se nemohlo stát že po zapnutí to vytáhne fucking 30mb image 💀


  const corsProxyURL = "https://michalho.cz/proxy/?url=" //Has to use proxy protože CORS :3
  const imageProxy = "https://michalho.cz/proxy/image.php?url="


  function get_random_api(nsfw) {
    const sfw_apiendpoints = ["https://api.waifu.pics/sfw/waifu", "https://api.waifu.pics/sfw/neko", "https://api.waifu.im/search?included_tags=waifu", "https://api.waifu.im/search?included_tags=maid", "https://api.waifu.im/search?included_tags=oppai", "https://api.waifu.im/search?included_tags=selfies", "https://api.waifu.im/search?included_tags=uniform", "https://pic.re/image.json", "https://nekos.best/api/v2/waifu", "https://nekos.best/api/v2/neko", "https://purrbot.site/api/img/sfw/neko/img", "https://nekos.life/api/neko", "https://nekos.life/api/v2/img/neko", "https://nekos.life/api/v2/img/ngif", "https://nekobot.xyz/api/image?type=neko", "https://nekobot.xyz/api/image?type=coffee", "https://nekos.best/api/v2/neko", "https://api.nekosapi.com/v3/images/random?limit=1&rating=safe", "https://api.nekosapi.com/v3/images/random?limit=1&rating=suggestive"]
    const nsfw_apiendpoints = ["https://api.waifu.pics/nsfw/waifu", "https://api.waifu.pics/nsfw/neko", "https://api.waifu.pics/nsfw/trap", "https://api.waifu.im/search?included_tags=hentai", "https://api.waifu.im/search?included_tags=ero", "https://api.waifu.im/search?included_tags=ecchi", "https://api.waifu.im/search?included_tags=milf", "https://purrbot.site/api/img/nsfw/neko/img", "https://nekobot.xyz/api/image?type=hass", "https://nekobot.xyz/api/image?type=hmidriff", "https://nekobot.xyz/api/image?type=hneko", "https://nekobot.xyz/api/image?type=hthigh", "https://nekobot.xyz/api/image?type=hentai", "https://nekobot.xyz/api/image?type=hkitsune", "https://nekobot.xyz/api/image?type=hanal", "https://nekobot.xyz/api/image?type=paizuri", "https://nekobot.xyz/api/image?type=tentacle", "https://nekobot.xyz/api/image?type=hboobs", "https://api.nekosapi.com/v3/images/random?limit=1&rating=borderline", "https://api.nekosapi.com/v3/images/random?limit=1&rating=explicit"]

    const all_apiendpoints = [...sfw_apiendpoints, ...nsfw_apiendpoints]

    const random_num_for_my_api = Math.floor(Math.random() * 11)
    const lower_than_random_num = random_num_for_my_api < 10

    if (!nsfw) {
      if (lower_than_random_num) {
        return get_apis_image_url_name(sfw_apiendpoints);
      } else {
        return ["https://michalho.cz/randompic/?type=sfw", "url"]
      }

    } else {
      if (lower_than_random_num) {
        return get_apis_image_url_name(all_apiendpoints);
      } else {
        return ["https://michalho.cz/randompic/?type=nsfw", "url"]
      }
    }
  }

  function get_apis_image_url_name(choosen_endpoint) {
    const random_num = Math.floor(Math.random() * choosen_endpoint.length)
    let choosen_url = choosen_endpoint[random_num];
    let result_endpointdongle;

    if (choosen_url.includes("api.waifu.pic")) {
      result_endpointdongle = "url";
    } else if (choosen_url.includes("api.waifu.im")) {
      result_endpointdongle = "images[0] > url";
    } else if (choosen_url.includes("api.nekosapi.com")){
      result_endpointdongle = "items[0] > image_url"
    } else if (choosen_url.includes("nekos.best")) {
      result_endpointdongle = "results[0] > url";
    } else if (choosen_url.includes("pic.re")) {
      result_endpointdongle = "file_url";
    } else if (choosen_url.includes("purrbot.site")) {
      result_endpointdongle = "link";
    } else if (choosen_url === "https://nekos.life/api/neko") {
      result_endpointdongle = "neko";
    } else if (choosen_url.includes("nekos.life")) {
      result_endpointdongle = "url";
    } else if (choosen_url.includes("nekobot.xyz")) {
      result_endpointdongle = "message";
    } else if (choosen_url.includes("neko.best")) {
      result_endpointdongle = "url"
    } else {
      result_endpointdongle = "image";
    }

    return [choosen_url, result_endpointdongle]

  }

  async function data_saver_allow_to_continue(url){
    console.warn(`savedata: ${savedata}`)
    if(!savedata) return true

    var headResponse

    try {
      headResponse = await fetch(url, { method: "HEAD"});
    } catch (error){
      
      console.error("Fetch for HEADERS error: " + error.message)
      console.table(error)

      if(error.message === "Failed to fetch"){ //probs CORS error, try with corsProxy

        try {
          headResponse = await fetch(corsProxyURL + url)
          console.warn("second try with CORS")

        } catch (error2){
          console.error("Fetch for HEADERS error even with CORS: " + error2.message)
          console.log("Gg alkane, idk co teď :(")
        }

      }
    }


    const contentLength = headResponse.headers.get("Content-Length");

    console.warn(`${contentLength / 1024 / 1024} MB`)

    if(!contentLength) return false
    
    const imageSizeLimit = 7 * 1024 * 1024; // 7 MB
    if (parseInt(contentLength, 10) < imageSizeLimit) { //if its smaller than imageSizeLimit then allow it to resume
      return true
    }
    return false
  }

  async function use_xhr(url){ //XHR abych mohl trackovat status, idk jak bych to udělal když bych dal do <img> jenom link na ten image
    var resume = await data_saver_allow_to_continue(url)

    if(!resume) return get_image() //if its below the set file size maximum, try again

    setImageURL(url)

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
        if(xhr.status !== 200) return get_image()
        var reader  = new FileReader();
        reader.onloadend = function() {
            setImageB64(reader.result);
            setLoading(false)
            console.warn("SUCCESS")
        }
      reader.readAsDataURL(xhr.response);
    }
    xhr.send();
    xhr.onerror = function() {
      console.warn("XHR failed, probably because of CORS, trying again")
      xhr.open("GET", imageProxy + url)
      xhr.send()
    };
  }

  async function get_image() {
    setLoading(true)

    var apiEndpoint = get_random_api(checkbox)

    console.log(apiEndpoint)
    var apiURL = apiEndpoint[0]

    var response;
    var status_code;

    try {
      response = await fetch(apiURL)
    } catch (error){

      console.error("Fetch error: " + error.message)
      console.table(error)

      if(error.message === "Failed to fetch"){ //probs CORS error, try with corsProxy

        try {
          response = await fetch(corsProxyURL + apiURL)
          console.warn("second try with CORS")

        } catch (error2){
          console.error("Fetch error even with CORS: " + error2.message)
          console.log("Gg alkane, jedem znova")
          return get_image()

        }

      }
    }

    status_code = response.status
    if(status_code !== 200) return get_image() //znovu zkusit dostat image

    response = await response.json()
    console.log(response)

    if (apiEndpoint[1] === "images[0] > url") {
      use_xhr(response.images[0].url);

      return
    }
    if (apiEndpoint[1] === "results[0] > url") {
      use_xhr(response.results[0].url);

      return
    }
    if (apiEndpoint[1] === "items[0] > image_url"){
      use_xhr(response.items[0].image_url);

      return
    }
     if (apiEndpoint[1] === "file_url") { //pic.re, it returns the url without https://
       use_xhr(`https://${response["file_url"]}`);

       return
     }


    use_xhr(response[apiEndpoint[1]]);
  }

  async function handle_image_click(){
    await Browser.open({ url: imageURL })
  }

  function reacted_to_click(smash) {
    if (smash) {
      console.log("smash")

      setSmashes((beforeSmashes) => beforeSmashes + 1)
    } else {
      console.log("pass")

      setPasses((beforePasses) => beforePasses + 1)
    }
  }

  return (
    <div className="container">
      <h1>Welcome to <br></br>Smash or Pass! :3</h1>

      <div>
        <img onClick={() => handle_image_click()} src={imageB64} alt="Random Anime IMG" />
        {loading ? (
          <img crossorigin="anonymous" src={loadingSVG} className="loading"></img>
        ) : (
          <div className="loading">

          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          get_image();
        }}
      >

        <button onClick={() => reacted_to_click(true)}>Smash</button>
        <input title="Will show SFW & NSFW" type="checkbox" id="nsfw" onChange={(e) => setCheckbox(e.currentTarget.checked)} />
        <label title="Will show SFW & NSFW" htmlFor="nsfw">NSFW?</label>
        <button onClick={() => reacted_to_click(false)}>Pass</button>

        <p>Total Smashes: {smashes}</p>
        <p>Total Passes: {passes}</p>

        <input title="Data save? (image size 7mb max)" type="checkbox" id="data_saver" onChange={(x) => setSavedata(x.currentTarget.checked)} checked={savedata}></input>
        <label title="Data save? (image size 7mb max)" htmlFor="data_saver">Data saver</label>

        <a onClick={() => setModal(!modal)}>
          <img src={uploadSVG} className="upload" title="Upload an Image"></img>
        </a>

      </form>

      {modal ? (<Modal toggleModal={() => setModal(!modal)}></Modal>) : (<></>)}
    </div>
  );
}

export default App;