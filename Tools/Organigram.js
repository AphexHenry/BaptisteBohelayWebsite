
function Organigram() 
{
    this.tree = [];
}

Organigram.prototype.GetFather = function(index)
{
    for (var i in this.tree) 
    {
        for(var childId = 0; childId < this.tree[i].length; childId++)
        {
            if(this.tree[i][childId] == index)
            {
                return i;
            }
        }
    }

    return -1;
}

Organigram.prototype.Map = function(father, child)
{
    if(!isdefined(this.tree[father]))
    {
        this.tree[father] = [];
    }
    this.tree[father].push(child);
}
