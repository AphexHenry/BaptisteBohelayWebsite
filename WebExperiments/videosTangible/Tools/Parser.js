

m_informationOutVect = new Array();
	var lines, subLine;
	var txtFile = new Array();
	var m_informationOutVect = new Array();

function ParseLogo(aPath) 
{
	txtFile.push(new XMLHttpRequest());
	var index = txtFile.length - 1;
	txtFile[index].open("GET", aPath, true);

	txtFile[index].onreadystatechange = function(){parseTheText(index)};

	txtFile[index].send(null);
}

var parseTheText = function(index) 
{
	  if (txtFile[index].readyState === 4) 
	  {  // Makes sure the document is ready to parse.
		    if (txtFile[index].status === 200) 
		    {  // Makes sure it's found the file.
			  if(index < m_informationOutVect.length)
			  	return;

		      allText = txtFile[index].responseText; 
		      lines = txtFile[index].responseText.split("\n"); // Will separate each line into an array
		      
			    var leftBorder, heigth, rightBorder;

			    m_informationOutVect.push(new Array());

				for(var i = 0; i < lines.length; i++)
				{
					if(lines[i] == "")
					{
						continue;
					}
					var l_tempPosition = {size:0, x:0, y:0};
					subLine = lines[i].split(" ");
					leftBorder = parseFloat(subLine[0]);
					heigth = parseFloat(subLine[1]);
					rightBorder = parseFloat(subLine[2]);
			        
			        l_tempPosition.size = (rightBorder - leftBorder);
			        l_tempPosition.x = leftBorder;
			        l_tempPosition.y = heigth;

			        m_informationOutVect[m_informationOutVect.length - 1].push(l_tempPosition);
				}

	  			indexLoading++;
				return;// (m_informationOutVect.length - 1);
		    }
	  }


}