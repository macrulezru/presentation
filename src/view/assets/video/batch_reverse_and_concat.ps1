# batch_reverse_and_concat.ps1
$files = Get-ChildItem -Filter *.mp4 | Where-Object { $_.Name -notmatch '_loop\.mp4$' -and $_.Name -notmatch '_reversed\.mp4$' }

foreach ($video in $files) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($video.Name)
    $reversed = "${name}_reversed.mp4"
    $concat = "${name}_concat_temp.mp4"
    $looped = "${name}_loop.mp4"
    $list = "${name}_list.txt"

    # 1. Reverse video
    ffmpeg -y -i $video.Name -vf reverse -af areverse $reversed

    # 2. Create concat list (ascii encoding, no BOM)
    "file '$($video.Name)'" | Out-File -Encoding ascii $list
    "file '$reversed'" | Out-File -Encoding ascii -Append $list

    # 3. Concat original + reversed (без перекодирования)
    ffmpeg -y -f concat -safe 0 -i $list -c copy $concat

    # 4. Перекодировать в H.265/HEVC (libx265) для уменьшения размера
    #    -crf 28  ← этот параметр отвечает за качество/размер (меньше = лучше качество, больше = меньше размер)
    #    -preset medium  ← скорость/эффективность кодирования (можно slow, fast и т.д.)
    #    -c:a aac -b:a 128k  ← аудио (можно изменить битрейт)
    ffmpeg -y -i $concat -c:v libx265 -crf 28 -preset medium -c:a aac -b:a 128k $looped

    # 5. Clean up
    Remove-Item $reversed, $list, $concat
}