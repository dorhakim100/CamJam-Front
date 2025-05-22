export const uploadService = {
  uploadImg,
}

async function uploadImg(ev: any): Promise<any> {
  const CLOUD_NAME = 'dnxi70mfs'
  const UPLOAD_PRESET = 'SportClub'
  const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const formData = new FormData()

  // Building the request body
  formData.append('file', ev.target.files[0])
  formData.append('upload_preset', UPLOAD_PRESET)

  // Sending a post method request to Cloudinary API
  try {
    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
    const imgData = await res.json()
    // console.log(imgData)
    return imgData
  } catch (err) {
    console.error(err)
    throw err
  }
}
