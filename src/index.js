import Phaser from 'phaser';
import * as doh from 'dohjs';
import {domains} from './names';
import {responseToLog} from './logger';

import myParticle from './assets/muzzleflash2.png'
// <a href='https://pngtree.com/so/dessert-clipart'>dessert clipart png from pngtree.com</a>
import cookieImg from './assets/cookie-simple.svg';

class MyGame extends Phaser.Scene
{
    constructor (_domains, _resolver)
    {
        super();
        this._domains = _domains;
        this._resolver = _resolver;
    }

    randomName() {
        return this._domains[Math.floor(Math.random() * this._domains.length)];
    }

    preload ()
    {
        this.load.image('cookie', cookieImg);
        this.load.image('my-particle', myParticle);
    }

    create ()
    {
        const div = document.createElement('div');
        div.style.overflowY = 'scroll';
        div.style.width = '780px';
        div.style.height = '250px';
        div.style.border = '3px solid #ffffff';
        const queryLog = document.createElement('ul');
        queryLog.style.listStyleType = 'none';
        queryLog.style.userSelect = 'none';
        queryLog.style.paddingLeft = '3px';
        div.append(queryLog);
        const domElem = this.add.dom(390, 560, div);

        const cookie = this.add.image(400, 200, 'cookie');
        cookie.setScale(0.5);
        cookie.setInteractive();
        cookie.addListener('pointerup', (e) => {
            emitter.emitParticleAt(e.x, e.y);

            const name = this.randomName();
            const pkt = doh.makeQuery(name, 'A');
            pkt.additionals = {
                type: 'OPT',
                name: '.',
                udpPayloadSize: 4096,
                options: [
                    {
                        code: 10,
                            data: Buffer.of('deadbeefdeadbeef', 'hex')
                    },
                ]
            }
            doh.sendDohMsg(pkt, 'https://dns.google/dns-query', 'GET')
                .then(handleResponse)
                .catch(handleError);

            function handleError(err) {
                console.error(err);
            }

            function handleResponse(response) {
                // TODO: log an answer from a resolver here
                const elem = document.createElement('li');
                elem.textContent = responseToLog(response);
                elem.style.color = '#00ff33';
                queryLog.append(elem);
                queryLog.lastChild.scrollIntoView();
            }
        });

        const particles = this.add.particles('my-particle');
        const emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            on: false,
        });
    }
}

const resolver = new doh.DohResolver('https://dns.google/dns-query');

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 700,
    scene: new MyGame(domains, resolver),
    physics: {
        default: 'arcade'
    },
    dom: {
        createContainer: true
    }
};

const game = new Phaser.Game(config);
