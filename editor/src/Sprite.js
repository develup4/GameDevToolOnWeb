/**
 * Created by HAM on 2014-06-22.
 */
SpriteSheetPainter = function (cells)
{
    this.cells = cells || [];
    this.cellIndex = 0;
}

SpriteSheetPainter.prototype = {
    advance : function()
    {
        if(this.cellIndex == this.cells.length - 1)
        {
            this.cellIndex = 0;
        }
        else
        {
            this.cellIndex++;
        }
    },

    paint : function(sprite, context)
    {
        var cell = this.cells[this.cellIndex];
        context.drawImage(spritesheet, cell.x, cell.y, cell.w, cell.h, sprite.left, sprite.top, cell.w, cell.h);
    }
};

var ImagePainter = function(imageUrl)
{
    this.image = new Image();
    this.image.src = imageUrl;
};

ImagePainter.prototype = {
    paint : function (sprite, context)
    {
        if(this.image.complete)
        {
            context.drawImage(this.image, sprite.left, sprite.top, sprite.width, sprite.height);
        }
    }
};

var SpriteAnimator = function(painters, elapsedCallback)
{
    this.painters = painters || [];
    this.elapsedCallback = elapsedCallback;
    this.duration = 1000;
    this.startTime = 0;
    this.index = 0;
};

SpriteAnimator.prototype = {
    end : function(sprite, originalPainter)
    {
        sprite.animating = false;
        if(this.elapsedCallback)
            this.elapsedCallback(sprite);
        else
            sprite.painter = originalPainter;
    },

    start : function(sprite, duration)
    {
        var endTime = +new Date() + duration,
            period = duration / (this.painters.length),
            animator = this,
            originalPainter = sprite.painter,
            lastUpdate = 0;

        this.index = 0;
        sprite.animating = true;
        sprite.painter = this.painters[this.index];

        requestNextAnimationFrame(function spriteAnimatorAnimate(time) {
            if(time < endTime) {
                if((time - lastUpdate) > period) {
                    sprite.painter = animator.painters[++animator.index];
                    lastUpdate = time;
                }

                requestNextAnimationFrame(spriteAnimatorAnimate);
            }
            else
            {
                animator.end(sprite, originalPainter);
            }
        });
    }
};

var Sprite = function(name, painter, behaviors) {
    if(name !== undefined)
        this.name = name;
    if(painter !== undefined)
        this.painter = painter;

    this.top = 0;
    this.left = 0;
    this.width = 10;
    this.height = 10;
    this.velocityX = 0;
    this.velocityY = 0;
    this.visible = true;
    this.animating = false;
    this.behaviors = behaviors || [];
    this.positionX = 0;
    this.positionY = 0;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;

    return this;

    // 왜 안들어가냐 쉬발럼아
};

Sprite.prototype = {
    paint : function(context)
    {
        if(this.painter !== undefined && this.visible)
        {
            this.painter.paint(this, context);
        }
    },

    update : function(context, time)
    {
        for(var i = 0; i < this.behaviors.length; ++i)
        {
            this.behaviors[i].execute(this, context, time);
        }
    }
};