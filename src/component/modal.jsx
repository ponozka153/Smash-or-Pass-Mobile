import { useEffect, useState } from "react"
import uploadSVG from "../assets/upload-modal.svg"

function Modal({ toggleModal }) {
  const [file, setFile] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [serverResponse, setServerResponse] = useState("");

  useEffect(() => {
    console.log(file)
  }, [file])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const imagePreview = URL.createObjectURL(selectedFile);
      setPreviewImage(imagePreview);
    } else {
      setPreviewImage(null);
    }
  };

  async function upload_image() {
    const formData = new FormData()

    formData.append("image", file)
    formData.append("nsfw", Number(checkbox))

    for (var pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }

    const response = await fetch("https://michalho.cz/randompic/upload/", {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text()

    setServerResponse(responseText);
    setFile("");
    setPreviewImage(null);
    console.log(response)
  }
  return (
    <div className="modal">
      <div onClick={toggleModal} className="overlay"></div>
      <div className="modal-content">
        <h2>Upload an Image :3</h2>
        <form className="modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            upload_image(e);
          }}
        >
          <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange}></input>

          {previewImage && (
            <img
              src={previewImage}
              alt="Selected Image"
              className="selected-image"
            />
          )}

          <div className="modal-checkbox">
            <input type="checkbox" id="nsfw" onChange={() => setCheckbox(!checkbox)}></input>
            <label htmlFor="nsfw">NSFW?</label>
          </div>

          <button type="submit">
            <img className="upload-modal-img" src={uploadSVG}></img>
          </button>

          {serverResponse && (
            <p className="server-response">{serverResponse}</p>
          )}
        </form>
        <button className="close-modal" onClick={toggleModal}>
          CLOSE
        </button>
      </div>
    </div>
  )
}

export default Modal