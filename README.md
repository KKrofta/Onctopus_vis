# Onctopus_vis

Onctopus_vis is a software that is developed to visualize the results of Onctopus.
Onctopus is a software that models and reconstructs the subclonal composition of a bulk tumor sample based on lineages.

## Installation:

Onctopus_vis has to be cloned from this repository.

The following packages have to be downloaded and put into the same folder as the index.html:
d3.js: https://github.com/d3/d3/releases

jquery-3.2.1.min.js: https://jquery.com/download/                    This requires version 3.2.1 (a renaming of the file to jquery-3.2.1.min.js for later versions might also work)

pdfkit.js: https://github.com/foliojs/pdfkit/releases                This has been tested with version 0.8

blob-stream.js: https://github.com/devongovett/blob-stream/releases  This has been tested with version 0.1.3

The onctopus_python_files folder of Onctopus has to be in the same folder as server.py. This is not publicly aviable yet.

## Usage:

First you have to start the server by switching to the directory server.py is in and then typing python server.py into the console.
The server is hosted at port 8000.

You know have to start a browser of your choice (tested for Mozilla Firefox) and got to the URL: http://localhost:8000/

On the top left should be a panel with multiple buttons. Clicking the browse button lets you select the input data
usually the result of Onctopus. You can select multiple files which will all be taken into account.
The files containing the informations about the relations between the lineages have to end with a '.Z'
and the files containing the other informations like the mutations have to end with a '.json'.
The files that belong together have to have the same name except the ending.

Clicking 'Generate Tree' generates the trees for all selected files. The nodes represent the lineages 
and the edges the relations between them. If there is a '.json' file containing the frequency information 
it is shown to the right of the node.

The frequency information is also shown in one of the tables on the bottom. The other table shows all the mutations for every lineage.
Both tables are only generated when the information is aviable through a '.json' file. If there are multiple trees 
with '.json' files aviable the last one is used for the generation of the tables.

Clicking a dotted edge of a tree changes the tree so that it represents a tree if the selected dotted edge which represents an
ambiguous relationship would be a certain relationship. The blue selected edges can also be deselected again.

With the selector below the 'generate tree' button you can select the segment of which the mutations are displayed. 
There are only segments to choose if there is a tree that has a '.json' file with mutations.

You can get the graphic of the trees as PDF either by clicking the 'get PDF' button on the top left of a tree 
if you want a PDF on of this tree or by clicking the 'get PDFs' button in the button panel to get 
the PDFs of all trees. To make this quicker you can set how the browser handles PDFs per default.
Usually you can set your preferences on what your browser should do if a url leads to a PDF 
so that your browser askes you how to handle it, opens it or downloads it directly. 
To do so in firefox you have to click edit on the top left then go to preferences and then scroll down to applications. 
PDF should be listed there.
