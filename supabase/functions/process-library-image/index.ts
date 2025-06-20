
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessImageRequest {
  imagePath: string;
  libraryElementId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { imagePath, libraryElementId }: ProcessImageRequest = await req.json()
    
    console.log(`Processing image: ${imagePath} for element: ${libraryElementId}`)
    
    // 1. Download the original image from library_elements bucket
    const { data: originalImage, error: downloadError } = await supabase.storage
      .from('library_elements')
      .download(imagePath.replace(`${supabaseUrl}/storage/v1/object/public/library_elements/`, ''))
    
    if (downloadError) {
      throw new Error(`Failed to download image: ${downloadError.message}`)
    }
    
    // 2. Convert to ArrayBuffer for processing
    const imageBuffer = await originalImage.arrayBuffer()
    
    // 3. Create WebP versions using Canvas API
    const { regularWebP, thumbnailWebP } = await processImageToWebP(imageBuffer)
    
    // 4. Generate unique folder name for this image
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().substring(0, 8)
    const folderName = `${timestamp}_${randomId}`
    
    // 5. Upload to user_uploads bucket
    const regularPath = `${folderName}/image.webp`
    const thumbnailPath = `${folderName}/thumbnail.webp`
    
    const { error: uploadRegularError } = await supabase.storage
      .from('user_uploads')
      .upload(regularPath, regularWebP, {
        contentType: 'image/webp',
        cacheControl: '3600'
      })
    
    if (uploadRegularError) {
      throw new Error(`Failed to upload regular image: ${uploadRegularError.message}`)
    }
    
    const { error: uploadThumbnailError } = await supabase.storage
      .from('user_uploads')
      .upload(thumbnailPath, thumbnailWebP, {
        contentType: 'image/webp',
        cacheControl: '3600'
      })
    
    if (uploadThumbnailError) {
      throw new Error(`Failed to upload thumbnail: ${uploadThumbnailError.message}`)
    }
    
    // 6. Get public URLs for the new images
    const { data: regularUrl } = supabase.storage
      .from('user_uploads')
      .getPublicUrl(regularPath)
    
    const { data: thumbnailUrl } = supabase.storage
      .from('user_uploads')
      .getPublicUrl(thumbnailPath)
    
    // 7. Update library_elements table with new paths
    const { error: updateError } = await supabase
      .from('library_elements')
      .update({
        image_path: regularUrl.publicUrl,
        // Store thumbnail path in a new field or use existing field
      })
      .eq('id', libraryElementId)
    
    if (updateError) {
      throw new Error(`Failed to update library element: ${updateError.message}`)
    }
    
    // 8. Delete original image from library_elements bucket
    const originalFileName = imagePath.replace(`${supabaseUrl}/storage/v1/object/public/library_elements/`, '')
    const { error: deleteError } = await supabase.storage
      .from('library_elements')
      .remove([originalFileName])
    
    if (deleteError) {
      console.warn(`Failed to delete original image: ${deleteError.message}`)
    }
    
    console.log(`Successfully processed image ${libraryElementId}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        regularPath: regularUrl.publicUrl,
        thumbnailPath: thumbnailUrl.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processImageToWebP(imageBuffer: ArrayBuffer) {
  // Create a canvas element to process the image
  const canvas = new OffscreenCanvas(800, 600)
  const ctx = canvas.getContext('2d')!
  
  // Create ImageBitmap from buffer
  const imageBitmap = await createImageBitmap(new Blob([imageBuffer]))
  
  // Calculate dimensions maintaining aspect ratio
  const maxWidth = 1200
  const maxHeight = 1200
  const maxThumbnailSize = 300
  
  let { width, height } = imageBitmap
  
  // Regular image - resize if too large
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }
  
  // Create regular WebP
  canvas.width = width
  canvas.height = height
  ctx.drawImage(imageBitmap, 0, 0, width, height)
  
  const regularWebP = await canvas.convertToBlob({
    type: 'image/webp',
    quality: 0.85
  })
  
  // Create thumbnail
  const thumbnailSize = Math.min(maxThumbnailSize, Math.min(width, height))
  canvas.width = thumbnailSize
  canvas.height = thumbnailSize
  
  // Center crop for thumbnail
  const sourceSize = Math.min(imageBitmap.width, imageBitmap.height)
  const sourceX = (imageBitmap.width - sourceSize) / 2
  const sourceY = (imageBitmap.height - sourceSize) / 2
  
  ctx.drawImage(
    imageBitmap,
    sourceX, sourceY, sourceSize, sourceSize,
    0, 0, thumbnailSize, thumbnailSize
  )
  
  const thumbnailWebP = await canvas.convertToBlob({
    type: 'image/webp',
    quality: 0.75
  })
  
  imageBitmap.close()
  
  return {
    regularWebP: await regularWebP.arrayBuffer(),
    thumbnailWebP: await thumbnailWebP.arrayBuffer()
  }
}
