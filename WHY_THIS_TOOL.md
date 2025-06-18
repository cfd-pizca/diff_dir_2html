# Why This Tool Makes Sense

This project provides a simple way to compare two directories by generating a persistent HTML diff. While tools like **Meld** can display differences locally, the resulting comparison disappears once the application closes and it is not easy to share or view remotely. By contrast, the HTML reports produced here can be kept alongside your data, published, or even viewed on a phone.

## Comparing OpenFOAM Cases

OpenFOAM simulations often use many configuration files spread across a directory. With this script you can copy a case directory, remove the results, modify the configuration, run a new simulation, and then generate an HTML report comparing the two directories. Because both the configuration and the results stay inside their respective case folders, you do not need to check out files or juggle multiple revisions.

While this example focuses on OpenFOAM, the same workflow can help manage other physics simulation projects. Frameworks such as **FEniCS** or **preCICE** also keep configuration and results in directory structures that benefit from easy comparison and persistent reports.

## Relationship with Git

Git excels at tracking changes in text files, but simulation results are typically large and may be stored with systems like Git LFS. Even if you version your input and output files, their hashes will never match. Keeping results directly inside each case directory links them with the exact configuration used, and this tool can highlight what changed between runs without extra checkout steps.

## Integration in Broader Reports

The generated HTML diff can be embedded in larger reports to show how different cases relate in terms of accuracy, performance, or numerical artefacts. Tools in other domains—such as FSL for fMRI analysis—produce similar reports to summarize multiple stages of processing. This project aims to provide that kind of accessible and shareable view for OpenFOAM or any directory-based workflow.

