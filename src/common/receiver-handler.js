/**
 * takes a list of handlers as object and play role of middleware when events occured.
 *
 * @return function middleware to process request.
 */
module.exports = (handlers) => {
	return (request, sender, sendResponse) => {
	  const type = request.type;

	  if (handlers.hasOwnProperty(type)) {
	    handlers[type](request, sender, sendResponse);
	  }

	  return true;
	};	
};
