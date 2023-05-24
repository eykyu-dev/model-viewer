class Light
{
    constructor(ambient, Id, Is)
    {
        this.ambient = ambient
        this.Id = Id
        this.Is = Is
    }
}

class pointLight extends Light
{
    constructor(ambient, position, Id, Is, k)
    {
        super(ambient, Id, Is)
        this.position = position
        this.k = k
        this.type = "point"
    }
}

class dLight extends Light
{
    constructor(ambient, direction, Id, Is)
    {
        super(ambient, Id, Is)
        this.direction = direction
        this.type = "direction"
    }
}

export
{

    pointLight,
    dLight
    
}