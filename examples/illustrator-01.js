import {
  config,
  argv,
} from 'nodobe'

// Create new document with 6 artboards
var docRef = app.documents.add(DocumentColorSpace.CMYK, 612.0, 792.0, 6, DocumentArtboardLayout.GridByRow, 20.0, 3);

// Create rectangle
var artboardRef = docRef.artboards[0];
var rect = docRef.pathItems.rectangle (artboardRef.artboardRect[1] - 20, artboardRef.artboardRect[0] + 20, 1200, 2350, false);
var rectColor = new CMYKColor();
rectColor.cyan = 0;
rectColor.magenta = 0;
rectColor.yellow = 20;
rectColor.black = 0;
rect.fillColor = rectColor;
