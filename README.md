# Message Manager API

This API's purpose is to provide features to store text records in a MongoDB instance in a way that duplicities can be avoided. In a simple comparison, two texts might look different but looking deeper it is possible to measure the similarity between them, and that is the goal, if there is some similarity, this API will detect it, then the user can decide what is different or not.
