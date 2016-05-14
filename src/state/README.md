#### Things, how they relate and how you view them
##### relationships
* everything is a thing
* things have properties
* links relate things to each other via link properties
* filters collect things via queries
* views contain groups via links and/or filters
* groups contain things via links and/or filters
* views have a layout via a property
* layouts display groups of things

#### STI data model
* A thing:
  * has attributes
  * can be cloned
* A Card:
  * is a thing
  * has a title and a description
* A link:
  * is a thing
  * has a type
  * associates two things
  * has rules for what it can associate
* A view:
  * is a thing
  * selects things based on a filter
  * displays things based on rules and a layout
* A group:
  * is a thing
  * can be a source or target in a "contains" link

#### How a view is made
- select all the things that have links to the current view
- 
- layout groups thing


