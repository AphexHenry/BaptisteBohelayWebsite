PImage img;       // The source image

int maxTileSize = 35;
int minTileSize = 2;
float aspectRatio = 1.f;
int tileSize = maxTileSize; // initial value of tile size to begin analyzing

String[] tcoords = new String[0];

int cols, rows;   // Number of columns and rows in our system

float cx;
float cy;

void setup()
{
  size(512, 300);   // size of canvas MUST equal size of image.
  img = loadImage("Gallery.png");     // Load the image
  image(img,0,0);
  
  frameRate(100);
  
  cols = width-tileSize;
  rows = height-floor(tileSize*aspectRatio);
  
  cx = cy = 0;
}

void draw()
{
  loadPixels();

  println ("checking row: " + cy);
  for (int ix=(int)cx; ix<cols; ix++){
    //println(":::" + floor(tileSize*aspectRatio));
    if (isBlack(ix,(int)cy,tileSize,floor(tileSize*aspectRatio))) {
      fill(255,0,0);
      noStroke();
      rect(ix,cy,tileSize,floor(tileSize*aspectRatio));
      String coords = ((float)(((float)ix+(float)tileSize/2.) - ((float)width/2.)) / (float)width) + " " + ((((float)cy+floor((float)tileSize*(float)aspectRatio)/2.) - ((float)height / 2.)) / (float)width ) + " " + (((float)(ix+tileSize)  - (width/2)) / (float)width);
      println ( coords );
      
      // push coords to array.
      tcoords = append(tcoords,coords);
      loadPixels();
    } else {
     //println (ix + "," + cy + " : nope"); 
    }
  }
  
//  cx++;
//  if (cx==cols){
//    cx = 0;
    cy++;
    if (cy==rows){
      cy = 0;
      tileSize--;
      cols = width-tileSize;
      rows = height-floor(tileSize*aspectRatio);
      if (tileSize<minTileSize){
        println("");
        println("done!");
        saveStrings("logocoords.txt", tcoords);
        exit();
      } 
    }
//  }
}

boolean isBlack( int left, int top, int ww, int hh){
  
  for (int i=left; i<left+ww; i++){
   for (int j=top; j<top+hh; j++){
     int loc = i + j*width;
     if (pixels[loc]!=color(0)){
       return false;
     }
   } 
  }
 return true; 
}
