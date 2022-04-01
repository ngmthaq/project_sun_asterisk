<?php

namespace App\Helpers;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Helpers
{
    const USER_FILESYSTEM_DRIVER = 'user';
    const STORE_SONG_DRIVER = 'song';
    const DEFAULT_AVATAR_PATH = 'assets/img/default-avatar.png';

    public static function storeUserAvatar($file)
    {
        if (!$file) {
            return self::DEFAULT_AVATAR_PATH;
        }

        $fileName = $file->getClientOriginalName();
        $fileName = Str::slug(pathinfo($fileName, PATHINFO_FILENAME)) . '-' . Carbon::now()->timestamp;
        $fileExt = $file->getClientOriginalExtension();
        $path = $file->storeAs('avatar', $fileName . '.' . $fileExt, self::USER_FILESYSTEM_DRIVER);

        return 'storage/' . self::USER_FILESYSTEM_DRIVER . '/' . $path;
    }

    public static function storeSongThumbnail($file)
    {
        $fileName = $file->getClientOriginalName();
        $fileName = Str::slug(pathinfo($fileName, PATHINFO_FILENAME)) . '-' . Carbon::now()->timestamp;
        $fileExt = $file->getClientOriginalExtension();
        $path = $file->storeAs('thumbnail', $fileName . '.' . $fileExt, self::STORE_SONG_DRIVER);

        return 'storage/' . self::STORE_SONG_DRIVER . '/' . $path;
    }

    public static function storeSong($file)
    {
        $fileName = $file->getClientOriginalName();
        $fileName = Str::slug(pathinfo($fileName, PATHINFO_FILENAME)) . '-' . Carbon::now()->timestamp;
        $fileExt = $file->getClientOriginalExtension();
        $path = $file->storeAs('source', $fileName . '.' . $fileExt, self::STORE_SONG_DRIVER);

        return 'storage/' . self::STORE_SONG_DRIVER . '/' . $path;
    }

    public static function randomColor()
    {
        $colors = config('search.bgColor');

        return $colors[rand(0, count($colors) - 1)];
    }

    public static function removeUserAvatar($path)
    {
        if (strcmp($path, self::DEFAULT_AVATAR_PATH) == 0) {
            return true;
        }

        $path = str_replace('storage', 'public', $path);

        return Storage::delete($path);
    }

    public static function markAsRead($id)
    {
        return auth()->user()->Notifications->find($id)->markAsRead();
    }

    public static function markAsReadAll()
    {
        return auth()->user()->Notifications->markAsRead();
    }
}
