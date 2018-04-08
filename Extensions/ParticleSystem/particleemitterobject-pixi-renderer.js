/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/


gdjs.ParticleEmitterObjectPixiRenderer = function(runtimeScene, runtimeObject, objectData){
    var texture = null;
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(0, 0, 0);
    graphics.beginFill(gdjs.rgbToHexNumber(255,255,255), 1);
    if(objectData.rendererType === "Point")
        graphics.drawCircle(0, 0, objectData.rendererParam1);
    else if(objectData.rendererType === "Line")
        graphics.drawRect(0, 0, objectData.rendererParam1, objectData.rendererParam2);
    else{
        if(objectData.textureParticleName){
            var sprite = new PIXI.Sprite(runtimeScene.getGame().getImageManager().getPIXITexture(objectData.textureParticleName));
            sprite.width = objectData.rendererParam1;
            sprite.height = objectData.rendererParam2;
            graphics.addChild(sprite);
        }
        else{
            graphics.drawRect(0, 0, objectData.rendererParam1, objectData.rendererParam2);
        }
    }
    graphics.endFill();
    texture = graphics.generateTexture();

    var config = {
        color: {
            list: [
                {
                    value: gdjs.rgbToHexNumber(objectData.particleRed1,
                                               objectData.particleGreen1,
                                               objectData.particleBlue1).toString(16),
                    time: 0
                },
                {
                    value: gdjs.rgbToHexNumber(objectData.particleRed2,
                                               objectData.particleGreen2,
                                               objectData.particleBlue2).toString(16),
                    time: 1
                }
            ],
            isStepped: false
        },
        speed: {
            list: [
                {
                    value: objectData.emitterForceMin,
                    time: 0
                },
                {
                    value: objectData.emitterForceMax,
                    time: 1
                }
            ],
            isStepped: false
        },
        acceleration: {
            x: objectData.particleGravityX,
            y: objectData.particleGravityY
        },
        lifetime: {
            min: objectData.particleLifeTimeMin,
            max: objectData.particleLifeTimeMax
        },
        frequency: 1.0/objectData.flow,
        spawnChance: 1,
        particlesPerWave: 1,
        maxParticles: objectData.maxParticleNb,
        emitterLifetime: -1,
        pos: {
            x: 0,
            y: 0
        },
        addAtBack: false,
        spawnType: "circle",
        spawnCircle: {
            x: 0,
            y: 0,
            r: objectData.zoneRadius
        }
    };

    // We need to adapt a bit the configuration of the speed of particles, instead of random minimum and maximum speed,
    // pixi-particles uses initial and final speed, this behavior can lead to a non-working particle system without this patch
    if(config.acceleration.x === 0 && config.acceleration.y === 0 &&
       config.speed.list[0].value === 0 && config.speed.list[1].value !== 0){
        config.speed.list[0].value = 0.00001;
    }

    if(objectData.alphaParam === "Mutable"){
        config.alpha = {list: [{time: 0, value: objectData.particleAlpha1/255.0},
                               {time: 1, value: objectData.particleAlpha2/255.0}],
                        isStepped: false};
    }
    else{
        config.alpha = {list: [{time: 0, value: objectData.particleAlpha1/255.0}],
                        isStepped: false};
    }

    if(objectData.sizeParam === "Mutable"){
        var size1 = objectData.particleSize1/100;
        var size2 = objectData.particleSize2/100;
        var sizeRandom1 = objectData.particleSizeRandomness1/100;
        var sizeRandom2 = objectData.particleSizeRandomness2/100;
        var m = sizeRandom2 !== 0 ? (1 + sizeRandom1)/(1 + sizeRandom2) : 1;
        config.scale = {list: [{time: 0, value: size1*(1+sizeRandom1)},
                               {time: 1, value: size2*(1+sizeRandom2)}],
                        minimumScaleMultiplier: m,
                        isStepped: false};
    }
    else{
        var size1 = objectData.particleSize1/100;
        var size2 = objectData.particleSize2/100;
        var mult = size2 !== 0 ? (1 + size1)/(1 + size2) : 1;
        if(size2 === 0 && size1 > size2){
            mult = (1 + size2)/(1 + size1);
            size2 = size1;
        }
        config.scale = {list: [{time: 0, value: size2}],
                        minimumScaleMultiplier: mult,
                        isStepped: false};
    }


    if(objectData.emissionEditionSimpleMode){
        config.startRotation = {min:-objectData.emitterAngleB/2.0,
                                max: objectData.emitterAngleB/2.0};
    }
    else{
        config.startRotation = {min: objectData.emitterAngleA,
                                max: objectData.emitterAngleB};
    }

    if(objectData.angleParam === "Mutable"){
        var mediumLifetime = (objectData.particleLifeTimeMin + objectData.particleLifeTimeMax)/2;
        config.rotationSpeed = { min: objectData.particleAngle1/mediumLifetime,
                                 max: objectData.particleAngle2/mediumLifetime };
    }
    else{
        config.startRotation = { min: objectData.particleAngle1,
                                 max: objectData.particleAngle2 };
        config.rotationSpeed = { min: 0, max: 0 };
    }

    config.blendMode = objectData.additive ? "ADD" : "NORMAL";

    this.renderer = new PIXI.Container();
    this.emitter = new PIXI.particles.Emitter(this.renderer, texture, config);
    this.emitter.emit = true;
    this.started = false;

    var layer = runtimeScene.getLayer("");
    if (layer) layer.getRenderer().addRendererObject(this.renderer, runtimeObject.getZOrder());
};
gdjs.ParticleEmitterObjectRenderer = gdjs.ParticleEmitterObjectPixiRenderer;

gdjs.ParticleEmitterObjectPixiRenderer.prototype.getRendererObject = function(){
    return this.renderer;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.update = function(delta){
    this.emitter.update(delta);
    if(!this.started && this.getParticleCount() > 0){
        this.started = true;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setPosition = function(x, y){
    this.emitter.spawnPos.x = x;
    this.emitter.spawnPos.y = y;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setAngle = function(angle1, angle2){
    this.emitter.minStartRotation = angle1;
    this.emitter.maxStartRotation = angle2;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setForce = function(min, max){
    // We need to adapt a bit the configuration of the speed of particles, instead of random minimum and maximum speed,
    // pixi-particles uses initial and final speed, this behavior can lead to a non-working particle system without this patch
    if(this.emitter.acceleration.x === 0 && this.emitter.acceleration.y === 0 && min === 0 && max !== 0){
        min = 0.00001;
    }

    this.emitter.startSpeed.value = min;
    if(this.emitter.startSpeed.next) this.emitter.startSpeed.next.value = max;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setZoneRadius = function(radius){
    this.emitter.spawnCircle.radius = radius;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setLifeTime = function(min, max){
    this.emitter.minLifetime = min;
    this.emitter.maxLifetime = max;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setGravity = function(x, y){
    this.emitter.acceleration.x = x;
    this.emitter.acceleration.y = y;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setColor = function(r1, g1, b1, r2, g2, b2){
    this.emitter.startColor.value.r = r1;
    this.emitter.startColor.value.g = g1;
    this.emitter.startColor.value.b = b1;
    this.emitter.startColor.next.value.r = r2;
    this.emitter.startColor.next.value.g = g2;
    this.emitter.startColor.next.value.b = b2;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setSize = function(size1, size2){
    this.emitter.startScale.value = size1/100.0;
    if(this.emitter.startScale.next){
        this.emitter.startScale.next.value = size2/100.0;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setAlpha = function(alpha1, alpha2){
    this.emitter.startAlpha.value = alpha1/255.0;
    if(this.emitter.startAlpha.next){
        this.emitter.startAlpha.next.value = alpha2/255.0;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setFlow = function(flow){
    this.emitter.frequency = 1.0/flow;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.isTextureValid = function(texture, runtimeScene){
    return runtimeScene.getGame().getImageManager().getPIXITexture(texture).valid;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.setTexture = function(texture, runtimeScene){
    var pixiTexture = runtimeScene.getGame().getImageManager().getPIXITexture(texture);
    if(pixiTexture.valid){
        this.emitter.particleImages[0] = pixiTexture;
    }
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.getTotalParticleCount = function(){
    return this.emitter.totalParticleCount;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.getParticleCount = function(){
    return this.emitter.particleCount;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.stop = function(){
    this.emitter.emit = false;
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.recreate = function(){
    this.emitter.cleanup();
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.destroy = function(){
    this.emitter.destroy();
};

gdjs.ParticleEmitterObjectPixiRenderer.prototype.hasStarted = function(){
    return this.started;
};