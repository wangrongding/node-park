import npmName from "npm-name";

// Check a package name
// console.log(await npmName("dssssasf"));

try {
  console.log(await npmName("ds-toolsa"));
  // await npmName("_ABC");
} catch (error) {
  console.log(error.message);
  // Invalid package name: _ABC
  // - name cannot start with an underscore
  // - name can no longer contain capital letters
}
