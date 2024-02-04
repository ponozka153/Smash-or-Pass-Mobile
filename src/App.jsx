import { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import Modal from "./component/modal.jsx";
import loadingSVG from "./assets/loading.svg";
import uploadSVG from "./assets/upload-main.svg"

function App() {
  const [checkbox, setCheckbox] = useState(false);
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

    get_image()
  }, []) //[] = run only once on component load nebo tak něco

  useEffect(() => {
    localStorage.setItem("smashes", smashes)
    localStorage.setItem("passes", passes)
  }, [smashes, passes]) //run on smashes||passes change

  function get_random_api(nsfw) {
    const sfw_apiendpoints = ["https://api.waifu.pics/sfw/waifu", "https://api.waifu.pics/sfw/neko", "https://api.waifu.im/search?included_tags=waifu&limit=1", "https://api.waifu.im/search?included_tags=maid&limit=1", "https://api.waifu.im/search?included_tags=oppai&limit=1", "https://api.waifu.im/search?included_tags=selfies&limit=1", "https://api.waifu.im/search?included_tags=uniform&limit=1", "http://api.nekos.fun:8080/api/neko", "https://pic.re/image.json", "https://nekos.best/api/v2/waifu", "https://nekos.best/api/v2/neko", "https://purrbot.site/api/img/sfw/neko/img", "https://hmtai.hatsunia.cfd/v2/neko_arts", "https://hmtai.hatsunia.cfd/v2/coffee_arts", "https://nekos.life/api/neko", "https://nekos.life/api/v2/img/neko", "https://nekos.life/api/v2/img/ngif", "https://nekobot.xyz/api/image?type=neko", "https://nekobot.xyz/api/image?type=coffee"]
    const nsfw_apiendpoints = ["https://api.waifu.pics/nsfw/waifu", "https://api.waifu.pics/nsfw/neko", "https://api.waifu.pics/nsfw/trap", "https://api.waifu.im/search?included_tags=hentai&limit=1", "https://api.waifu.im/search?included_tags=ero&limit=1", "https://api.waifu.im/search?included_tags=ecchi&limit=1", "https://api.waifu.im/search?included_tags=milf&limit=1", "http://api.nekos.fun:8080/api/hentai", "http://api.nekos.fun:8080/api/lesbian", "http://api.nekos.fun:8080/api/lewd", "http://api.nekos.fun:8080/api/belle", "https://purrbot.site/api/img/nsfw/neko/img", "https://hmtai.hatsunia.cfd/v2/hentai", "https://hmtai.hatsunia.cfd/v2/ero", "https://hmtai.hatsunia.cfd/v2/yuri", "https://hmtai.hatsunia.cfd/v2/pantsu", "https://hmtai.hatsunia.cfd/v2/uniform", "https://hmtai.hatsunia.cfd/v2/thighs", "https://hmtai.hatsunia.cfd/v2/boobs", "https://hmtai.hatsunia.cfd/v2/nsfwNeko", "https://nekobot.xyz/api/image?type=hass", "https://nekobot.xyz/api/image?type=hmidriff", "https://nekobot.xyz/api/image?type=hneko", "https://nekobot.xyz/api/image?type=hthigh"]

    const all_apiendpoints = [...sfw_apiendpoints, ...nsfw_apiendpoints]

    const random_num_for_my_api = Math.floor(Math.random() * 16)
    const lower_than_random_num = random_num_for_my_api < 15

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
    const choosen_url = choosen_endpoint[random_num];
    let result_endpointdongle;

    if (choosen_url.includes("api.waifu.pic")) {
      result_endpointdongle = "url";
    } else if (choosen_url.includes("api.waifu.im")) {
      result_endpointdongle = "images[0] > url";
    } else if (choosen_url.includes("pic.re")) {
      result_endpointdongle = "file_url";
    } else if (choosen_url.includes("nekos.best")) {
      result_endpointdongle = "results[0] > url";
    } else if (choosen_url.includes("purrbot.site")) {
      result_endpointdongle = "link";
    } else if (choosen_url.includes("hmtai.hatsunia.cfd")) {
      result_endpointdongle = "url";
    } else if (choosen_url === "https://nekos.life/api/neko") {
      result_endpointdongle = "neko";
    } else if (choosen_url.includes("nekos.life")) {
      result_endpointdongle = "url";
    } else if (choosen_url.includes("ekobot.xyz")) {
      result_endpointdongle = "message";
    } else {
      result_endpointdongle = "image";
    }

    return [choosen_url, result_endpointdongle]

  }

  function use_xhr(url){
    setImageURL(url)

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
        var reader  = new FileReader();
        reader.onloadend = function() {
            setImageB64(reader.result);
            setLoading(false)
        }
        reader.readAsDataURL(xhr.response);
    }
    xhr.send();
  }

  async function get_image() {
    setLoading(true)

    var apiEndpoint = get_random_api(checkbox)
    var corsProxyURL = "https://michalho.cz/proxy/?url=" //Has to use proxy protože jedno api je http takže cors se může posrat, will also be on github
    var imageProxy = "https://michalho.cz/proxy/image.php?url=" //Has to be used if the img src is in https://konachan.com cause for some reason Edge explorer wont render the picture in <img>, bruh
    console.log(apiEndpoint)
    var apiURL = apiEndpoint[0]

    var response;

    apiURL.includes("api.nekos.fun") || apiURL.includes("purrbot.site") ? response = await fetch(corsProxyURL + apiURL) : response = await fetch(apiURL)
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
    if (apiEndpoint[1] === "file_url") {
      use_xhr(`https://${response["file_url"]}`);

      return
    }
    if (response[apiEndpoint[1]].includes("https://konachan.com") || response[apiEndpoint[1]].includes("https://files.yande.re") || response[apiEndpoint[1]].includes("https://cdn.nekos.life") || response[apiEndpoint[1]].includes("https://cdn.nekobot.xyz") || response[apiEndpoint[1]].includes("https://i.waifu.pics")) {
      use_xhr(imageProxy + response[apiEndpoint[1]]);
      setImageURL(response[apiEndpoint[1]])

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
          <img src={loadingSVG} className="loading"></img>
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

        <a onClick={() => setModal(!modal)}>
          <img src={uploadSVG} className="upload" title="Upload an Image"></img>
        </a>

      </form>

      {modal ? (<Modal toggleModal={() => setModal(!modal)}></Modal>) : (<></>)}
    </div>
  );
}

export default App;