[the block](http://bl.ocks.org/syntagmatic/4076122) that contains the shell (bash?) command to create a tsv file with the filepaths and filesizes for every file in a directory (and it's subdirectories)

---

A visualization of files in the [src](https://github.com/mbostock/d3/tree/3.0/src) directory of the d3 repository, based on [Reingold-Tilford Tree](http://bl.ocks.org/4063550).

## Data Collection

Use [git](http://git-scm.com/) to clone a repository, then [du](http://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html) to create a tsv with the directory contents.

    git clone git://github.com/mbostock/d3.git
    (echo -n 'size\tfile\n'; du -a d3) > d3.tsv

## Burrow - recursive nesting

Branches may go to an arbitrary depth. [burrow()](https://gist.github.com/4076122#file_burrow.js) creates this data structure from a JSON table. It's still getting tweaked, an example will go here when it's ready.