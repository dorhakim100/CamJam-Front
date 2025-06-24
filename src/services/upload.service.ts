export const uploadService = {
  uploadImg,
}

async function uploadImg(
  evOrFile: React.ChangeEvent<HTMLInputElement> | File
): Promise<any> {
  if (!evOrFile) throw new Error(`Couldn't upload file`)
  const CLOUD_NAME = 'dpsnczn5n'
  const UPLOAD_PRESET = 'CamJam'
  const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const formData = new FormData()

  // Building the request body
  if (evOrFile instanceof File) {
    formData.append('file', evOrFile)
  } else if ('target' in evOrFile && evOrFile.target.files?.[0]) {
    formData.append('file', evOrFile.target.files[0])
  }
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
