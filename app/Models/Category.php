<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Category extends Model
{
    use HasFactory;

    const PIVOT_TABLE = 'category_song';

    protected $fillable = [
        'name',
        'description',
    ];

    public function songs()
    {
        return $this->belongsToMany(Song::class, self::PIVOT_TABLE);
    }

    public function getCreatedAtAttribute($value)
    {
        return $this->attributes['created_at'] = Carbon::parse($value)
            ->format(config('admin.format.datetime'));
    }

    public function getUpdatedAtAttribute($value)
    {
        return $this->attributes['updated_at'] = Carbon::parse($value)
            ->format(config('admin.format.datetime'));
    }
}
