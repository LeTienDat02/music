const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const cd = $('.cd')
const audio = $('#audio')
const btnPlay = $('.btn.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const cdThumb = $('.cd-thumb')
const nextSong = $('.btn.btn-next')
const prevSong = $('.btn.btn-prev')
const randomSong = $('.btn.btn-random')
const repeatSong = $('.btn.btn-repeat')
const playList = $('.playlist')

const PLAYER_STORAGE_KEY = 'MUSIC'

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'At My Worst',
            singer: 'PinkSweat',
            path: './assets/music/AtMyWorst.mp3',
            image: './assets/images/AtMyWorst.jpg'
        },
        {
            name: 'Fallin',
            singer: 'PinkSweat',
            path: './assets/music/Fallin.mp3',
            image: './assets/images/Fallin.jpg'
        },
        {
            name: 'Luv Letters Frad',
            singer: 'PinkSweat',
            path: './assets/music/LuvLettersFrad.mp3',
            image: './assets/images/LuvLettersFrad.jpg'
        },
        {
            name: 'Windy Hill',
            singer: 'PinkSweat',
            path: './assets/music/WindyHill.mp3',
            image: './assets/images/WindyHill.jpg'
        },
        {
            name: 'You Dont Know Me',
            singer: 'PinkSweat',
            path: './assets/music/YouDontKnowMe.mp3',
            image: './assets/images/YouDontKnowMe.jpg'
        },        {
            name: 'Fly',
            singer: 'PinkSweat',
            path: './assets/music/Fly.mp3',
            image: './assets/images/Fly.jpg'
        }
        ,        {
            name: 'Gác Lại Âu Lo',
            singer: 'PinkSweat',
            path: './assets/music/GacLaiAuLo.mp3',
            image: './assets/images/GacLaiAuLo.jpg'
        },
        {
            name: 'The Sun',
            singer: 'PinkSweat',
            path: './assets/music/TheSun.mp3',
            image: './assets/images/TheSun.jpg'
        }
    ],

    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex? 'active': ''}"data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        }).join('')
        $('.playlist').innerHTML = htmls
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvent: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        //handle hidden the cd when scroll
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //handle rotate cd
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],
            {
                duration: 10000,
                iterations: Infinity
            }
        )
        cdThumbAnimate.pause()
        
        //handle control the song
        btnPlay.onclick = function () {
            if(_this.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }

        //when pause the song
        audio.onplay = function () {
            _this.isPlaying = true
            _this.setConfig('isPlaying', _this.isPlaying)
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //when play the song
        audio.onpause = function () {
            _this.isPlaying = false
            _this.setConfig('isPlaying', _this.isPlaying)
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //update progress the song
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //handle when rewind the song
        progress.onchange = function (e) {
            const audioTime = audio.duration / 100 * e.target.value
            audio.currentTime = audioTime
        }

        //handle next the song
        nextSong.onclick = function () {
            if(_this.isRandom) {
                _this.randomSong()
            }else {
                _this.nextSong()
            }
            audio.play()
            _this.onTopSong()
            _this.render()
        }
        
        //handle prev the song
        prevSong.onclick = function () {
            if(_this.isRandom) {
                _this.randomSong()
            }else {
                _this.prevSong()
            }
            audio.play()
            _this.onTopSong()
            _this.render()
        }

        //handle random song
        randomSong.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            this.classList.toggle('active', _this.isRandom)
        }

        //handle next the song when end song
        audio.onended = function () {
            if(_this.isRepeat) {
                audio.play()
            }else {
                nextSong.click()
            }
        }

        //handle repeat song
        repeatSong.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            this.classList.toggle('active', _this.isRepeat)
        }

        //handle select song
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                if(songNode) {
                    _this.currentIndex = songNode.dataset.index
                    console.log(_this.currentIndex)
                    _this.loadCurrentSong()
                    _this.onTopSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },

    nextSong: function () {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },

    randomSong: function () {
        let indexRandom
        do {
            indexRandom = Math.round(Math.random() * this.songs.length - 1)
        }while(indexRandom === this.currentIndex)
        this.currentIndex = indexRandom

        this.loadCurrentSong()
    },

    onTopSong: function () {
        const firstSongs = this.songs.slice(this.currentIndex)
        const lastSongs = this.songs.slice(0, this.currentIndex)
        this.songs = firstSongs.concat(lastSongs)
        this.currentIndex = 0
    },

    loadCurrentSong: function () {
        $('header h2').innerText = this.currentSong.name
        $('.cd-thumb').style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },

    start: function () {
        this.handleEvent()

        this.defineProperties()

        this.loadCurrentSong()
        
        this.render()

    }
}

app.start()
