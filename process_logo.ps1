Add-Type -AssemblyName System.Drawing
$inputFile = "C:\Users\jones\Downloads\LLACI-main\LLACI-main\Logo_transparent_backup.png"
$outputFile = "C:\Users\jones\Downloads\LLACI-main\LLACI-main\Logo_transparent.png"

# The target color from the user's uploaded image (approximate cornflower/light blue)
$targetR = 122
$targetG = 153
$targetB = 232

$img = [System.Drawing.Image]::FromFile($inputFile)
$bmp = New-Object System.Drawing.Bitmap($img)
$img.Dispose()

$width = $bmp.Width
$height = $bmp.Height

# Lock bits for faster processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, $bmp.PixelFormat)

$bytesPerPixel = 4
$byteCount = $bmpData.Stride * $height
$pixels = New-Object byte[] $byteCount

[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $pixels, 0, $byteCount)

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $i = ($y * $bmpData.Stride) + ($x * $bytesPerPixel)
        $b = $pixels[$i]
        $g = $pixels[$i+1]
        $r = $pixels[$i+2]
        $a = $pixels[$i+3]

        if ($a -gt 0) {
            # Check if the pixel is blue-ish
            # The original logo had a gradient from dark blue to lighter blue.
            # Green swoosh will have G dominant.
            if ($b -gt $r -and $b -ge ($g - 20)) {
                $pixels[$i] = $targetB
                $pixels[$i+1] = $targetG
                $pixels[$i+2] = $targetR
                # Keep $a as is
            }
        }
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($pixels, 0, $bmpData.Scan0, $byteCount)
$bmp.UnlockBits($bmpData)

$bmp.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output "Processing complete."
